import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, ArrowRight, Loader2, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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

  const quickActions = [
    { icon: ShieldCheck, title: "Pending Approval", description: "Review officer decisions", href: "/supervisor/approval" },
    { icon: TrendingUp, title: "Performance", description: "Team analytics", href: "/supervisor/analytics" },
    { icon: Users, title: "Team Management", description: "Officer assignments", href: "/supervisor/team" },
    { icon: AlertTriangle, title: "Escalations", description: "High-value claims", href: "/supervisor/escalations" },
  ];

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
              Welcome, {user?.user_metadata?.full_name || "Supervisor"}
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
                  <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <action.icon className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
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
          <h3 className="text-lg font-semibold text-foreground">Approval Queue</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <StatusCard
                title="Pending Approval"
                value={stats.supervisorApproval}
                subtitle="Needs your decision"
                icon={Clock}
                variant="warning"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <StatusCard
                title="Total Claims"
                value={stats.total}
                subtitle={formatCurrency(stats.totalAmount)}
                icon={TrendingUp}
                variant="default"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <StatusCard
                title="Approved"
                value={stats.approved + stats.paid}
                subtitle={formatCurrency(stats.approvedAmount)}
                icon={CheckCircle2}
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

      {/* Claims Awaiting Approval */}
      <div className="animate-slide-up" style={{ animationDelay: "0.35s" }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif">Awaiting Your Approval</CardTitle>
                <CardDescription>Claims reviewed by officers pending supervisor decision</CardDescription>
              </div>
              <Link to="/supervisor/approval">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <StaffClaimsTable 
              statuses={["supervisor_approval"]} 
              limit={10}
              showActions={true}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupervisorDashboard;
