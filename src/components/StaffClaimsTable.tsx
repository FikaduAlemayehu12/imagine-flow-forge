import { Eye, MoreHorizontal, Loader2, CheckCircle, XCircle, ArrowRight, ShieldCheck, AlertTriangle, AlertCircle, ClipboardCheck, FileSearch } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useClaimsByStatus, ClaimStatus, useUpdateClaimStatus, RiskLevel } from "@/hooks/useStaffClaims";
import { useToast } from "@/hooks/use-toast";

interface StaffClaimsTableProps {
  statuses: ClaimStatus[];
  limit?: number;
  showActions?: boolean;
}

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-300" },
  submitted: { label: "Submitted", className: "bg-blue-50 text-blue-700 border-blue-200" },
  under_review: { label: "Under Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
  risk_assessment: { label: "Risk Assessment", className: "bg-orange-50 text-orange-700 border-orange-200" },
  officer_review: { label: "Officer Review", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  supervisor_approval: { label: "Supervisor Approval", className: "bg-purple-50 text-purple-700 border-purple-200" },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
  payment_processing: { label: "Payment Processing", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  paid: { label: "Paid", className: "bg-green-50 text-green-700 border-green-200" },
};

const riskConfig: Record<RiskLevel, { label: string; icon: typeof ShieldCheck; className: string; decision: string }> = {
  low: {
    label: "Low Risk",
    icon: ShieldCheck,
    className: "bg-green-100 text-green-700 border-green-200",
    decision: "Auto-Approve",
  },
  medium: {
    label: "Medium Risk",
    icon: AlertCircle,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    decision: "Partial Audit",
  },
  high: {
    label: "High Risk",
    icon: AlertTriangle,
    className: "bg-orange-100 text-orange-700 border-orange-200",
    decision: "Full Manual Audit",
  },
  critical: {
    label: "Critical Risk",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-700 border-red-200",
    decision: "Full Manual Audit + Escalation",
  },
};

const StaffClaimsTable = ({ statuses, limit, showActions = false }: StaffClaimsTableProps) => {
  const { data: claims = [], isLoading } = useClaimsByStatus(statuses);
  const updateStatus = useUpdateClaimStatus();
  const { toast } = useToast();

  const displayedClaims = limit ? claims.slice(0, limit) : claims;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleStatusUpdate = async (claimId: string, newStatus: ClaimStatus) => {
    try {
      await updateStatus.mutateAsync({ claimId, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Claim status changed to ${statusConfig[newStatus].label}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update claim status",
        variant: "destructive",
      });
    }
  };

  const getRiskBasedActions = (claimId: string, riskLevel: RiskLevel | null | undefined) => {
    if (!riskLevel) {
      // No risk assessment yet — standard actions
      return (
        <>
          <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "risk_assessment")}>
            <FileSearch className="h-4 w-4 mr-2" />
            Send to Risk Assessment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "officer_review")}>
            <ArrowRight className="h-4 w-4 mr-2" />
            Move to Officer Review
          </DropdownMenuItem>
        </>
      );
    }

    switch (riskLevel) {
      case "low":
        return (
          <>
            <DropdownMenuLabel className="text-green-700 text-xs">
              <ShieldCheck className="h-3 w-3 inline mr-1" />
              Low Risk — Auto-Approve Eligible
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-emerald-600"
              onClick={() => handleStatusUpdate(claimId, "approved")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Auto-Approve (Low Risk)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "supervisor_approval")}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Forward to Supervisor
            </DropdownMenuItem>
          </>
        );
      case "medium":
        return (
          <>
            <DropdownMenuLabel className="text-yellow-700 text-xs">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Medium Risk — Partial Audit Required
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "officer_review")}>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Partial Audit Review
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "supervisor_approval")}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Forward to Supervisor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-emerald-600"
              onClick={() => handleStatusUpdate(claimId, "approved")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve After Audit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleStatusUpdate(claimId, "rejected")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </DropdownMenuItem>
          </>
        );
      case "high":
      case "critical":
        return (
          <>
            <DropdownMenuLabel className="text-red-700 text-xs">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              {riskLevel === "critical" ? "Critical" : "High"} Risk — Full Manual Audit Required
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "under_review")}>
              <FileSearch className="h-4 w-4 mr-2" />
              Assign to MoR Audit Team
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(claimId, "supervisor_approval")}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Escalate to Supervisor
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-emerald-600"
              onClick={() => handleStatusUpdate(claimId, "approved")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve After Full Audit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleStatusUpdate(claimId, "rejected")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </DropdownMenuItem>
          </>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (displayedClaims.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No claims found in this queue.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Claim ID</TableHead>
            <TableHead className="font-semibold text-foreground">VAT Period</TableHead>
            <TableHead className="font-semibold text-foreground">Amount</TableHead>
            <TableHead className="font-semibold text-foreground">Submitted</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground">Risk Level</TableHead>
            <TableHead className="font-semibold text-foreground">Decision</TableHead>
            {showActions && <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedClaims.map((claim) => {
            const risk = claim.risk_level ? riskConfig[claim.risk_level] : null;
            const RiskIcon = risk?.icon;

            return (
              <TableRow key={claim.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">{claim.claim_number}</TableCell>
                <TableCell className="text-muted-foreground">{claim.vat_period}</TableCell>
                <TableCell className="font-medium text-foreground">{formatCurrency(Number(claim.claim_amount))}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(claim.submitted_at || claim.created_at)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusConfig[claim.status].className}>
                    {statusConfig[claim.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {risk && RiskIcon ? (
                    <Badge variant="outline" className={`${risk.className} flex items-center gap-1 w-fit`}>
                      <RiskIcon className="h-3 w-3" />
                      {risk.label}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not assessed</span>
                  )}
                </TableCell>
                <TableCell>
                  {risk ? (
                    <span className={`text-xs font-medium ${
                      claim.risk_level === "low" ? "text-green-700" :
                      claim.risk_level === "medium" ? "text-yellow-700" :
                      "text-red-700"
                    }`}>
                      {risk.decision}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64">
                          {getRiskBasedActions(claim.id, claim.risk_level)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffClaimsTable;
