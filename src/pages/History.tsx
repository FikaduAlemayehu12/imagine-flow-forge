import { useState } from "react";
import { Download, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRefunds } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const History = () => {
  const refunds = useRefunds();
  const [yearFilter, setYearFilter] = useState("2024");

  const approvedRefunds = refunds.filter((r) => r.status === "approved");
  const rejectedRefunds = refunds.filter((r) => r.status === "rejected");
  
  const totalApproved = approvedRefunds.reduce((sum, r) => sum + r.amount, 0);
  const totalRejected = rejectedRefunds.reduce((sum, r) => sum + r.amount, 0);

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

  // Group by month
  const monthlyData = refunds.reduce((acc, refund) => {
    const month = new Date(refund.submittedDate).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (!acc[month]) {
      acc[month] = { total: 0, approved: 0, count: 0 };
    }
    acc[month].total += refund.amount;
    acc[month].count += 1;
    if (refund.status === "approved") {
      acc[month].approved += refund.amount;
    }
    return acc;
  }, {} as Record<string, { total: number; approved: number; count: number }>);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Refund History
            </h1>
            <p className="text-muted-foreground mt-1">
              View your complete VAT refund transaction history
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/15">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Approved</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalApproved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-accent/15">
                  <TrendingDown className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rejected</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(totalRejected)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Approved Claims</p>
              <p className="text-2xl font-bold text-foreground">{approvedRefunds.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-primary">
                {refunds.length > 0 
                  ? Math.round((approvedRefunds.length / refunds.length) * 100) 
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Monthly Breakdown</CardTitle>
            <CardDescription>Refund claims by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(monthlyData).map(([month, data]) => (
                <div key={month} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-foreground">{month}</p>
                    <p className="text-sm text-muted-foreground">{data.count} claims submitted</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(data.total)}</p>
                    <p className="text-sm text-primary">{formatCurrency(data.approved)} approved</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Completed Transactions</CardTitle>
            <CardDescription>Recently processed refund claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...approvedRefunds, ...rejectedRefunds]
                .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                .slice(0, 5)
                .map((refund) => (
                  <div
                    key={refund.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          refund.status === "approved" ? "bg-primary" : "bg-accent"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-foreground">{refund.claimId}</p>
                        <p className="text-sm text-muted-foreground">{refund.vatPeriod}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(refund.amount)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(refund.submittedDate)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
