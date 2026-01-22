import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, Loader2, TrendingUp, Eye, FileText, DollarSign } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StaffClaimsTable from "@/components/StaffClaimsTable";

const SupervisorDashboard = () => {
  const { stats, isLoading } = useClaimsStats();
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Supervisor Dashboard
            </h2>
            <p className="text-muted-foreground">
              Welcome, {user?.user_metadata?.full_name || "Supervisor"} — <span className="text-purple-600 font-medium">View Only Mode</span>
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Claims Overview (Read Only)</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <StatusCard
                title="Total Claims"
                value={stats.total}
                subtitle={formatCurrency(stats.totalAmount)}
                icon={FileText}
                variant="default"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <StatusCard
                title="In Progress"
                value={stats.submitted + stats.underReview + stats.officerReview + stats.supervisorApproval}
                subtitle="Active processing"
                icon={Clock}
                variant="warning"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <StatusCard
                title="Approved"
                value={stats.approved + stats.paid}
                subtitle={formatCurrency(stats.approvedAmount)}
                icon={CheckCircle2}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <StatusCard
                title="Rejected"
                value={stats.rejected}
                subtitle="Total rejected"
                icon={AlertTriangle}
                variant="danger"
              />
            </div>
          </div>
        )}
      </section>

      {/* Status Breakdown */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Status Breakdown
            </CardTitle>
            <CardDescription>Detailed view of all claim statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{stats.submitted}</p>
                <p className="text-xs text-blue-600">Submitted</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-2xl font-bold text-amber-700">{stats.underReview}</p>
                <p className="text-xs text-amber-600">Under Review</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200">
                <p className="text-2xl font-bold text-cyan-700">{stats.officerReview}</p>
                <p className="text-xs text-cyan-600">Officer Review</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                <p className="text-2xl font-bold text-purple-700">{stats.supervisorApproval}</p>
                <p className="text-xs text-purple-600">Awaiting Approval</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
                <p className="text-xs text-green-600">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* All Claims - View Only (no actions) */}
      <div className="animate-slide-up" style={{ animationDelay: "0.35s" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  All Claims Status
                </CardTitle>
                <CardDescription>Complete overview of all refund claims (view only)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* showActions is FALSE for supervisor - view only */}
            <StaffClaimsTable 
              statuses={["submitted", "under_review", "risk_assessment", "officer_review", "supervisor_approval", "approved", "rejected", "payment_processing", "paid"]} 
              limit={20}
              showActions={false}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupervisorDashboard;
