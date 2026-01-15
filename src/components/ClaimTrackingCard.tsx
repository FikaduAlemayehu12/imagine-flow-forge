import { useState } from "react";
import { Search, Copy, CheckCircle2, Clock, FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateClaimPDF } from "@/lib/pdfGenerator";

interface ClaimTrackingCardProps {
  showSearch?: boolean;
}

const ClaimTrackingCard = ({ showSearch = true }: ClaimTrackingCardProps) => {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);
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
      } else {
        toast({
          title: "Claim Not Found",
          description: "No claim found with this tracking code",
          variant: "destructive",
        });
        setClaimData(null);
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
