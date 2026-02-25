import { useState, useEffect } from "react";
import { Search, Copy, Clock, Download, Loader2, AlertTriangle, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateClaimPDF } from "@/lib/pdfGenerator";
import { Badge } from "@/components/ui/badge";

interface ClaimTrackingCardProps {
  showSearch?: boolean;
}

interface RiskAssessment {
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  recommendation: string | null;
  assessment_details: any;
}

interface WorkflowEntry {
  id: string;
  from_status: string | null;
  to_status: string;
  action_type: string;
  comments: string | null;
  created_at: string;
}

const ClaimTrackingCard = ({ showSearch = true }: ClaimTrackingCardProps) => {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowEntry[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Subscribe to real-time updates when we have claim data
  useEffect(() => {
    if (!claimData) return;

    const channel = supabase
      .channel(`claim-${claimData.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workflow_states",
          filter: `claim_id=eq.${claimData.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setWorkflowHistory((prev) => [...prev, payload.new as WorkflowEntry]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "refund_claims",
          filter: `id=eq.${claimData.id}`,
        },
        (payload) => {
          setClaimData(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [claimData?.id]);

  const handleSearch = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Enter Tracking Code",
        description: "Please enter a valid claim tracking code",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      const { data, error } = await supabase
        .from("refund_claims")
        .select("*")
        .eq("claim_number", trackingCode.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setClaimData(data);

        // Fetch risk assessment
        const { data: riskData } = await supabase
          .from("risk_assessments")
          .select("risk_level, risk_score, recommendation, assessment_details")
          .eq("claim_id", data.id)
          .order("assessed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setRiskAssessment(riskData);

        // Fetch workflow history
        const { data: workflow } = await supabase
          .from("workflow_states")
          .select("*")
          .eq("claim_id", data.id)
          .order("created_at", { ascending: true });

        setWorkflowHistory(workflow || []);
      } else {
        toast({
          title: "Claim Not Found",
          description: "No claim found with this tracking code",
          variant: "destructive",
        });
        setClaimData(null);
        setRiskAssessment(null);
        setWorkflowHistory([]);
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Failed to search for claim",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Tracking code copied to clipboard" });
  };

  const handleDownloadPDF = async () => {
    if (!claimData) return;
    setIsGeneratingPDF(true);
    try {
      await generateClaimPDF(claimData);
      toast({ title: "PDF Downloaded", description: "Your claim statement has been downloaded" });
    } catch {
      toast({ title: "Download Failed", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return "text-primary bg-primary/10";
      case "rejected":
        return "text-accent bg-accent/10";
      default:
        return "text-secondary-foreground bg-secondary/20";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review — MoR Audit Team",
      risk_assessment: "Risk Assessment",
      officer_review: "Officer Review — Partial Audit",
      supervisor_approval: "Supervisor Approval",
      approved: "Approved",
      rejected: "Rejected",
      payment_processing: "Payment Processing",
      paid: "Completed — Payment Transferred",
    };
    return labels[status] || status;
  };

  const getRiskLevelBadge = (level: string) => {
    const config: Record<string, { icon: any; className: string; label: string }> = {
      low: { icon: ShieldCheck, className: "bg-green-100 text-green-700 border-green-200", label: "Low Risk" },
      medium: { icon: AlertCircle, className: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Medium Risk" },
      high: { icon: AlertTriangle, className: "bg-orange-100 text-orange-700 border-orange-200", label: "High Risk" },
      critical: { icon: AlertTriangle, className: "bg-red-100 text-red-700 border-red-200", label: "Critical Risk" },
    };
    const { icon: Icon, className, label } = config[level] || config.medium;
    return (
      <Badge variant="outline" className={`${className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getTimelineIcon = (actionType: string, toStatus: string) => {
    if (toStatus === "approved" || toStatus === "paid") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (toStatus === "rejected") return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (actionType === "auto_risk_assessment") return <ShieldCheck className="h-4 w-4 text-blue-600" />;
    if (toStatus === "under_review") return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getActionLabel = (entry: WorkflowEntry) => {
    const labels: Record<string, string> = {
      auto_risk_assessment: "Risk Assessment Completed",
      auto_approve: "Auto-Approved (Low Risk)",
      route_partial_audit: "Routed for Partial Audit",
      route_full_audit: "Assigned to MoR Audit Team",
      submit: "Claim Submitted",
      officer_review: "Officer Review Started",
      supervisor_forward: "Forwarded to Supervisor",
      approve: "Approved by Supervisor",
      reject: "Rejected",
      payment_initiate: "Payment Processing Initiated",
      payment_complete: "Payment Completed",
    };
    return labels[entry.action_type] || entry.action_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getApprovalMessage = (status: string, riskLevel?: string) => {
    if (status === "approved" || status === "paid") {
      return {
        icon: CheckCircle2,
        title: status === "paid" ? "Payment Completed" : "Claim Approved",
        message: riskLevel === "low"
          ? "Your claim passed all verification checks with a low risk assessment and was auto-approved."
          : "Your claim has been reviewed and approved.",
        className: "bg-green-50 border-green-200 text-green-800",
      };
    }
    if (status === "rejected") {
      return {
        icon: AlertTriangle,
        title: "Claim Rejected",
        message: "Your claim could not be approved. Please review the requirements.",
        className: "bg-red-50 border-red-200 text-red-800",
      };
    }
    if (status === "under_review" && (riskLevel === "high" || riskLevel === "critical")) {
      return {
        icon: AlertCircle,
        title: "Full Manual Audit in Progress",
        message: "Your claim is being audited by the Ministry of Revenues Audit Team due to elevated risk indicators.",
        className: "bg-orange-50 border-orange-200 text-orange-800",
      };
    }
    if (status === "officer_review" && riskLevel === "medium") {
      return {
        icon: Clock,
        title: "Partial Audit in Progress",
        message: "Your claim is undergoing a partial audit by an assigned officer.",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      };
    }
    if (status === "risk_assessment") {
      return {
        icon: ShieldCheck,
        title: "Risk Assessment in Progress",
        message: "Your claim is being evaluated against 39 risk parameters.",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      };
    }
    return null;
  };

  const statusMessage = claimData ? getApprovalMessage(claimData.status, riskAssessment?.risk_level) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Track Your Claim
        </CardTitle>
        <CardDescription>Enter your tracking code to check your claim status in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSearch && (
          <div className="flex gap-2">
            <Input
              placeholder="e.g., VAT-2026-000001"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              className="font-mono"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {claimData && (
          <div className="space-y-4 animate-fade-in">
            {/* Status Message */}
            {statusMessage && (
              <div className={`rounded-lg border p-4 ${statusMessage.className}`}>
                <div className="flex items-start gap-3">
                  <statusMessage.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">{statusMessage.title}</h4>
                    <p className="text-sm mt-1 opacity-90">{statusMessage.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Claim Details */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tracking Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-primary">{claimData.claim_number}</span>
                  <button onClick={() => copyToClipboard(claimData.claim_number)} className="p-1 hover:bg-primary/10 rounded">
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(claimData.status)}`}>
                  {getStatusLabel(claimData.status)}
                </span>
              </div>

              {riskAssessment && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Assessment</span>
                    {getRiskLevelBadge(riskAssessment.risk_level)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <span className="font-medium text-sm">{riskAssessment.risk_score.toFixed(0)}/100</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Claim Amount</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(claimData.claim_amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">VAT Period</span>
                <span>{claimData.vat_period}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(claimData.submitted_at || claimData.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Recommendation */}
            {riskAssessment?.recommendation && (
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Decision & Recommendation</h5>
                <p className="text-sm">{riskAssessment.recommendation}</p>
              </div>
            )}

            {/* Real-time Status History Timeline */}
            {workflowHistory.length > 0 && (
              <div className="border border-border rounded-lg p-4">
                <h5 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Status History (Real-time)
                </h5>
                <div className="space-y-0">
                  {workflowHistory.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getTimelineIcon(entry.action_type, entry.to_status)}
                        </div>
                        {index < workflowHistory.length - 1 && (
                          <div className="w-0.5 h-full min-h-[24px] bg-border" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{getActionLabel(entry)}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" "}
                            {new Date(entry.created_at).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {entry.comments && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.comments}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download PDF */}
            <Button variant="outline" className="w-full" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Claim Statement (PDF)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClaimTrackingCard;
