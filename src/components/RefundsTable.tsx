import { Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Refund {
  id: string;
  claimId: string;
  vatPeriod: string;
  amount: number;
  submittedDate: string;
  status: "approved" | "pending" | "rejected" | "processing";
}

const RefundsTable = () => {
  const refunds: Refund[] = [
    {
      id: "1",
      claimId: "RC-2024-001",
      vatPeriod: "Q1 2024",
      amount: 125000,
      submittedDate: "2024-03-15",
      status: "approved",
    },
    {
      id: "2",
      claimId: "RC-2024-002",
      vatPeriod: "Q2 2024",
      amount: 89500,
      submittedDate: "2024-06-20",
      status: "processing",
    },
    {
      id: "3",
      claimId: "RC-2024-003",
      vatPeriod: "March 2024",
      amount: 45000,
      submittedDate: "2024-04-05",
      status: "pending",
    },
    {
      id: "4",
      claimId: "RC-2024-004",
      vatPeriod: "April 2024",
      amount: 32000,
      submittedDate: "2024-05-10",
      status: "rejected",
    },
    {
      id: "5",
      claimId: "RC-2024-005",
      vatPeriod: "May 2024",
      amount: 78000,
      submittedDate: "2024-06-08",
      status: "approved",
    },
  ];

  const getStatusBadge = (status: Refund["status"]) => {
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

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-serif text-foreground">Pending Refunds</CardTitle>
            <CardDescription>Track and manage your VAT refund claims</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-sm">
            View All
          </Button>
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
              {refunds.map((refund) => (
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundsTable;
