import { ArrowLeft, FileSearch, Shield, AlertTriangle, CheckCircle, BarChart3, History } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import StaffClaimsTable from "@/components/StaffClaimsTable";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";

const AuditQueue = () => {
  const { stats } = useClaimsStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const auditPriorities = [
    { level: "Critical", count: 2, color: "bg-red-100 text-red-700 border-red-200" },
    { level: "High", count: 5, color: "bg-orange-100 text-orange-700 border-orange-200" },
    { level: "Medium", count: 12, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { level: "Low", count: 8, color: "bg-green-100 text-green-700 border-green-200" },
  ];

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
              Audit Queue
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive audit trail and compliance verification
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatusCard
            title="Pending Audit"
            value={stats.approved + stats.paid}
            subtitle="Approved claims"
            icon={FileSearch}
            variant="warning"
          />
          <StatusCard
            title="High Risk"
            value={7}
            subtitle="Flagged for review"
            icon={AlertTriangle}
            variant="danger"
          />
          <StatusCard
            title="Completed Audits"
            value={45}
            subtitle="This quarter"
            icon={CheckCircle}
            variant="success"
          />
          <StatusCard
            title="Total Audited"
            value={formatCurrency(12500000)}
            subtitle="Claim value"
            icon={Shield}
            variant="default"
          />
        </div>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Audit Priority Distribution
            </CardTitle>
            <CardDescription>Claims categorized by risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {auditPriorities.map((priority) => (
                <div key={priority.level} className="text-center p-4 rounded-lg border">
                  <Badge className={`${priority.color} border mb-2`}>
                    {priority.level}
                  </Badge>
                  <p className="text-2xl font-bold text-foreground">{priority.count}</p>
                  <p className="text-sm text-muted-foreground">Claims</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Claims for Audit</CardTitle>
            <CardDescription>Review approved claims for compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all">All Claims</TabsTrigger>
                <TabsTrigger value="highrisk">High Risk</TabsTrigger>
                <TabsTrigger value="random">Random Sample</TabsTrigger>
                <TabsTrigger value="completed">Audited</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <StaffClaimsTable 
                  statuses={["approved", "paid"]} 
                  showActions={false}
                />
              </TabsContent>
              
              <TabsContent value="highrisk">
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>High-risk claims flagged for detailed review</p>
                  <p className="text-sm">Based on risk assessment scores</p>
                </div>
              </TabsContent>
              
              <TabsContent value="random">
                <div className="text-center py-8 text-muted-foreground">
                  <FileSearch className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Random sampling for quality assurance</p>
                  <p className="text-sm">Automated selection based on criteria</p>
                </div>
              </TabsContent>
              
              <TabsContent value="completed">
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Completed audit records</p>
                  <p className="text-sm">View historical audit findings</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AuditQueue;
