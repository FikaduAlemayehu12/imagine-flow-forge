import { Settings, Users, TrendingUp, AlertTriangle, ArrowRight, Loader2, Database, Shield, FileSearch, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StaffClaimsTable from "@/components/StaffClaimsTable";

const AdminDashboard = () => {
  const { stats, isLoading } = useClaimsStats();
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const quickActions = [
    { icon: Users, title: "User Management", description: "Manage all users & roles", href: "/admin/users", color: "rose" },
    { icon: FileSearch, title: "All Claims", description: "View & manage claims", href: "/officer/review", color: "blue" },
    { icon: UserPlus, title: "Assign Officers", description: "Delegate tasks", href: "/history", color: "emerald" },
    { icon: Shield, title: "System Control", description: "Full access", href: "/admin/security", color: "purple" },
  ];

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <Settings className="h-5 w-5 text-rose-700" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Administrator Dashboard
            </h2>
            <p className="text-muted-foreground">
              Welcome, {user?.user_metadata?.full_name || "Administrator"} — <span className="text-rose-600 font-medium">Full System Control</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="border-border card-hover cursor-pointer group h-full">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-lg bg-${action.color}-50 flex items-center justify-center group-hover:bg-${action.color}-100 transition-colors`}>
                    <action.icon className={`h-5 w-5 md:h-6 md:w-6 text-${action.color}-600`} />
                  </div>
                  <h3 className="font-medium text-foreground text-xs md:text-sm mb-0.5 md:mb-1">{action.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Status Overview Cards */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">System Overview</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <StatusCard
                title="Total Claims"
                value={stats.total}
                subtitle={formatCurrency(stats.totalAmount)}
                icon={Database}
                variant="default"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <StatusCard
                title="In Progress"
                value={stats.submitted + stats.underReview + stats.officerReview + stats.supervisorApproval}
                subtitle="Active claims"
                icon={TrendingUp}
                variant="warning"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <StatusCard
                title="Completed"
                value={stats.approved + stats.paid}
                subtitle={formatCurrency(stats.approvedAmount)}
                icon={Shield}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <StatusCard
                title="Rejected"
                value={stats.rejected}
                subtitle="This period"
                icon={AlertTriangle}
                variant="danger"
              />
            </div>
          </div>
        )}
      </section>

      {/* All Claims with Full Actions */}
      <div className="animate-slide-up" style={{ animationDelay: "0.35s" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif">All Claims (Full Control)</CardTitle>
                <CardDescription>Manage all claims - approve, reject, assign, and process</CardDescription>
              </div>
              <Link to="/officer/review">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Admin has showActions TRUE - full control */}
            <StaffClaimsTable 
              statuses={["submitted", "under_review", "risk_assessment", "officer_review", "supervisor_approval", "approved", "rejected", "paid"]} 
              limit={15}
              showActions={true}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;
