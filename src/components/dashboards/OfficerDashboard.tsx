import { FileSearch, Clock, CheckCircle2, AlertTriangle, ArrowRight, Loader2, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StaffClaimsTable from "@/components/StaffClaimsTable";

const OfficerDashboard = () => {
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
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <FileSearch className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Officer Dashboard
            </h2>
            <p className="text-muted-foreground">
              Welcome, {user?.user_metadata?.full_name || "Officer"} — Review & assign claims
            </p>
          </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Claims Overview</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <StatusCard
                title="Awaiting Review"
                value={stats.submitted + stats.underReview}
                subtitle="Needs your attention"
                icon={Clock}
                variant="warning"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <StatusCard
                title="Under Review"
                value={stats.officerReview}
                subtitle="In progress"
                icon={FileSearch}
                variant="default"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <StatusCard
                title="Approved"
                value={stats.approved}
                subtitle={formatCurrency(stats.approvedAmount)}
                icon={CheckCircle2}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <StatusCard
                title="Rejected"
                value={stats.rejected}
                subtitle="Requires attention"
                icon={AlertTriangle}
                variant="danger"
              />
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions for Officers */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileSearch className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Review Claims</h4>
                  <p className="text-sm text-muted-foreground">Process pending submissions</p>
                </div>
                <Link to="/officer/review">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    View Queue <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Assign Claims</h4>
                  <p className="text-sm text-muted-foreground">Delegate to team members</p>
                </div>
                <Link to="/history">
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    All Claims <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Claims Queue with Actions */}
      <div className="animate-slide-up" style={{ animationDelay: "0.35s" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif">Claims Queue</CardTitle>
                <CardDescription>Review, process, and assign claims to appropriate handlers</CardDescription>
              </div>
              <Link to="/officer/review">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* showActions is TRUE for officers - they can take actions and assign */}
            <StaffClaimsTable 
              statuses={["submitted", "under_review", "officer_review", "supervisor_approval"]} 
              limit={15}
              showActions={true}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OfficerDashboard;
