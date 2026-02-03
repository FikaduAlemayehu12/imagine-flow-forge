import { useState } from "react";
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

const ClaimTrackingCard = ({ showSearch = true }: ClaimTrackingCardProps) => {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        
        // Fetch risk assessment for this claim
        const { data: riskData } = await supabase
          .from("risk_assessments")
          .select("risk_level, risk_score, recommendation, assessment_details")
          .eq("claim_id", data.id)
          .order("assessed_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        setRiskAssessment(riskData);
      } else {
        toast({
          title: "Claim Not Found",
          description: "No claim found with this tracking code",
          variant: "destructive",
        });
        setClaimData(null);
        setRiskAssessment(null);
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
    toast({
      title: "Copied",
      description: "Tracking code copied to clipboard",
    });
  };

  const handleDownloadPDF = async () => {
    if (!claimData) return;
    
    setIsGeneratingPDF(true);
    
    try {
      await generateClaimPDF(claimData);
      toast({
        title: "PDF Downloaded",
        description: "Your claim statement has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
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
      under_review: "Under Review",
      risk_assessment: "Risk Assessment",
      officer_review: "Officer Review",
      supervisor_approval: "Supervisor Approval",
      approved: "Approved",
      rejected: "Rejected",
      payment_processing: "Payment Processing",
      paid: "Paid",
    };
    return labels[status] || status;
  };

  const getRiskLevelBadge = (level: string) => {
    const config: Record<string, { icon: any; className: string; label: string }> = {
      low: {
        icon: ShieldCheck,
        className: "bg-green-100 text-green-700 border-green-200",
        label: "Low Risk",
      },
      medium: {
        icon: AlertCircle,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        label: "Medium Risk",
      },
      high: {
        icon: AlertTriangle,
        className: "bg-orange-100 text-orange-700 border-orange-200",
        label: "High Risk",
      },
      critical: {
        icon: AlertTriangle,
        className: "bg-red-100 text-red-700 border-red-200",
        label: "Critical Risk",
      },
    };

    const { icon: Icon, className, label } = config[level] || config.medium;

    return (
      <Badge variant="outline" className={`${className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getApprovalMessage = (status: string, riskLevel?: string) => {
    if (status === "approved" || status === "paid") {
      return {
        icon: CheckCircle2,
        title: "Claim Approved",
        message: riskLevel === "low" 
          ? "Your claim passed all verification checks with a low risk assessment."
          : "Your claim has been reviewed and approved by the supervisor.",
        className: "bg-green-50 border-green-200 text-green-800",
      };
    }
    
    if (status === "rejected") {
      return {
        icon: AlertTriangle,
        title: "Claim Rejected",
        message: "Your claim could not be approved. Please review the requirements and ensure all documentation is complete.",
        className: "bg-red-50 border-red-200 text-red-800",
      };
    }

    if (riskLevel === "high" || riskLevel === "critical") {
      return {
        icon: AlertCircle,
        title: "Additional Review Required",
        message: "Your claim requires additional documentation or senior review due to elevated risk assessment.",
        className: "bg-orange-50 border-orange-200 text-orange-800",
      };
    }

    if (riskLevel === "medium") {
      return {
        icon: Clock,
        title: "Standard Review",
        message: "Your claim is undergoing standard review process.",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      };
    }

    return null;
  };

  const statusMessage = claimData 
    ? getApprovalMessage(claimData.status, riskAssessment?.risk_level)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Track Your Claim
        </CardTitle>
        <CardDescription>
          Enter your tracking code to check your claim status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSearch && (
          <div className="flex gap-2">
            <Input
              placeholder="e.g., VAT-2024-000001"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
              className="font-mono"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {claimData && (
          <div className="space-y-4 animate-fade-in">
            {/* Status Message Card */}
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

            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              {/* Tracking Code */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tracking Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-primary">
                    {claimData.claim_number}
                  </span>
                  <button
                    onClick={() => copyToClipboard(claimData.claim_number)}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(claimData.status)}`}>
                  {getStatusLabel(claimData.status)}
                </span>
              </div>

              {/* Risk Level (if available) */}
              {riskAssessment && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Assessment</span>
                  {getRiskLevelBadge(riskAssessment.risk_level)}
                </div>
              )}

              {/* Risk Score (if available) */}
              {riskAssessment && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk Score</span>
                  <span className="font-medium text-sm">
                    {riskAssessment.risk_score.toFixed(0)}/100
                  </span>
                </div>
              )}

              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Claim Amount</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("en-ET", {
                    style: "currency",
                    currency: "ETB",
                  }).format(claimData.claim_amount)}
                </span>
              </div>

              {/* VAT Period */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">VAT Period</span>
                <span>{claimData.vat_period}</span>
              </div>

              {/* Submitted Date */}
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

            {/* Recommendation (for rejected or high risk) */}
            {riskAssessment?.recommendation && 
             (claimData.status === "rejected" || riskAssessment.risk_level === "high" || riskAssessment.risk_level === "critical") && (
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Recommendation
                </h5>
                <p className="text-sm">{riskAssessment.recommendation}</p>
              </div>
            )}

            {/* Download PDF */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
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
