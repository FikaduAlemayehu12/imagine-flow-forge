import { Eye, MoreHorizontal, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRefundClaims, transformClaimForUI } from "@/hooks/useRefundClaims";

interface RefundsTableProps {
  searchQuery?: string;
  statusFilter?: string;
  limit?: number;
}

const RefundsTable = ({ searchQuery = "", statusFilter = "all", limit }: RefundsTableProps) => {
  const { data: claims = [], isLoading } = useRefundClaims();
  
  // Transform claims to UI format
  const allRefunds = claims.map(transformClaimForUI);
  
  // Filter refunds
  let refunds = allRefunds.filter((refund) => {
    const matchesSearch = 
      refund.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.vatPeriod.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Apply limit if specified
  if (limit) {
    refunds = refunds.slice(0, limit);
  }

  type RefundStatus = "approved" | "pending" | "processing" | "rejected";
  
  const getStatusBadge = (status: RefundStatus) => {
    const styles = {
      approved: "status-badge-approved",
      pending: "status-badge-pending",
      processing: "bg-info/15 text-info border border-info/30",
      rejected: "status-badge-rejected",
    };

    const labels = {
      approved: "Approved",
      pending: "Pending Review",
      processing: "Processing",
      rejected: "Rejected",
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

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

  if (isLoading) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-serif text-foreground">
              {statusFilter === "all" ? "All Claims" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Claims`}
            </CardTitle>
            <CardDescription>
              {refunds.length} claim{refunds.length !== 1 ? "s" : ""} found
            </CardDescription>
          </div>
          {limit && (
            <Link to="/claims">
              <Button variant="outline" size="sm" className="text-sm">
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="font-semibold text-foreground">Claim ID</TableHead>
                <TableHead className="font-semibold text-foreground">VAT Period</TableHead>
                <TableHead className="font-semibold text-foreground">Amount</TableHead>
                <TableHead className="font-semibold text-foreground">Submitted</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No claims found. Submit your first claim to get started.
                  </TableCell>
                </TableRow>
              ) : (
                refunds.map((refund) => (
                  <TableRow key={refund.id} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{refund.claimId}</TableCell>
                    <TableCell className="text-muted-foreground">{refund.vatPeriod}</TableCell>
                    <TableCell className="font-medium text-foreground">{formatCurrency(refund.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(refund.submittedDate)}</TableCell>
                    <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundsTable;
