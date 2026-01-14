import { Eye, MoreHorizontal, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClaimsByStatus, ClaimStatus, useUpdateClaimStatus } from "@/hooks/useStaffClaims";
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
            {showActions && <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedClaims.map((claim) => (
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStatusUpdate(claim.id, "officer_review")}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Move to Officer Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(claim.id, "supervisor_approval")}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Move to Supervisor
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-emerald-600"
                          onClick={() => handleStatusUpdate(claim.id, "approved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleStatusUpdate(claim.id, "rejected")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffClaimsTable;
