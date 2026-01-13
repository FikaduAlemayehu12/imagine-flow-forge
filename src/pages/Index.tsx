import { DollarSign, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import StatusCard from "@/components/StatusCard";
import RefundClaimForm from "@/components/RefundClaimForm";
import RefundsTable from "@/components/RefundsTable";
import QuickActions from "@/components/QuickActions";
import { useStats } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const Index = () => {
  const stats = useStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
          Welcome Back, Taxpayer
        </h2>
        <p className="text-muted-foreground">
          Track your VAT refund claims and manage your tax records
        </p>
      </div>

      {/* Quick Actions */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <QuickActions />
      </section>

      {/* Status Overview Cards */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Refund Status Overview</h3>
          <Link to="/history">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View History <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <StatusCard
              title="Total Claims"
              value={stats.totalClaims}
              subtitle="All time submissions"
              icon={DollarSign}
              variant="default"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <StatusCard
              title="Pending Review"
              value={stats.pendingReview}
              subtitle="Awaiting approval"
              icon={Clock}
              variant="warning"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <StatusCard
              title="Approved"
              value={stats.approved}
              subtitle={formatCurrency(stats.totalApprovedAmount)}
              icon={CheckCircle2}
              variant="success"
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <StatusCard
              title="Rejected"
              value={stats.rejected}
              subtitle="Review required"
              icon={XCircle}
              variant="danger"
            />
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Refunds Table - Takes 2 columns */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.35s" }}>
          <RefundsTable limit={5} />
        </div>

        {/* Submit Claim Form - Takes 1 column */}
        <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <RefundClaimForm />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
