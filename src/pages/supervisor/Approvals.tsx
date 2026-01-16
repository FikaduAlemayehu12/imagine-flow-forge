import { ArrowLeft, CheckCircle, XCircle, Clock, FileCheck, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffClaimsTable from "@/components/StaffClaimsTable";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";
import { useAuth } from "@/contexts/AuthContext";

const Approvals = () => {
  const { stats } = useClaimsStats();
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Supervisor Approvals
            </h1>
            <p className="text-muted-foreground mt-1">
              Final approval authority for reviewed claims
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatusCard
            title="Awaiting Approval"
            value={stats.supervisorApproval}
            subtitle="Ready for review"
            icon={Clock}
            variant="warning"
          />
          <StatusCard
            title="Approved This Month"
            value={stats.approved}
            subtitle={formatCurrency(stats.approvedAmount)}
            icon={CheckCircle}
            variant="success"
          />
          <StatusCard
            title="Rejected"
            value={stats.rejected}
            subtitle="This month"
            icon={XCircle}
            variant="danger"
          />
          <StatusCard
            title="Team Performance"
            value={`${Math.round((stats.approved / (stats.total || 1)) * 100)}%`}
            subtitle="Approval rate"
            icon={TrendingUp}
            variant="default"
          />
        </div>

        {/* Approval Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Approval Queue
            </CardTitle>
            <CardDescription>Claims forwarded for your approval decision</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                <TabsTrigger value="approved">Recently Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                <StaffClaimsTable 
                  statuses={["supervisor_approval"]} 
                  showActions={true}
                />
              </TabsContent>
              
              <TabsContent value="approved">
                <StaffClaimsTable 
                  statuses={["approved", "payment_processing", "paid"]} 
                  showActions={false}
                />
              </TabsContent>
              
              <TabsContent value="rejected">
                <StaffClaimsTable 
                  statuses={["rejected"]} 
                  showActions={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Activity
            </CardTitle>
            <CardDescription>Officer performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Team activity metrics coming soon</p>
              <p className="text-sm">Track officer performance and workload distribution</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Approvals;
