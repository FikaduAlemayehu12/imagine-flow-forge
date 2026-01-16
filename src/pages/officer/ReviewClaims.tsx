import { ArrowLeft, FileSearch, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffClaimsTable from "@/components/StaffClaimsTable";
import StatusCard from "@/components/StatusCard";
import { useClaimsStats } from "@/hooks/useStaffClaims";

const ReviewClaims = () => {
  const { stats, isLoading } = useClaimsStats();

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
              Review Claims
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and process submitted VAT refund claims
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatusCard
            title="Pending Review"
            value={stats.submitted}
            subtitle="New submissions"
            icon={Clock}
            variant="warning"
          />
          <StatusCard
            title="Under Review"
            value={stats.underReview}
            subtitle="In progress"
            icon={FileSearch}
            variant="default"
          />
          <StatusCard
            title="Approved Today"
            value={stats.approved}
            subtitle="Forwarded"
            icon={CheckCircle}
            variant="success"
          />
          <StatusCard
            title="Flagged"
            value={stats.rejected}
            subtitle="Needs attention"
            icon={AlertTriangle}
            variant="danger"
          />
        </div>

        {/* Claims Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Claims Queue</CardTitle>
            <CardDescription>Process claims by status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="review">In Review</TabsTrigger>
                <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                <StaffClaimsTable 
                  statuses={["submitted"]} 
                  showActions={true}
                />
              </TabsContent>
              
              <TabsContent value="review">
                <StaffClaimsTable 
                  statuses={["under_review", "officer_review"]} 
                  showActions={true}
                />
              </TabsContent>
              
              <TabsContent value="risk">
                <StaffClaimsTable 
                  statuses={["risk_assessment"]} 
                  showActions={true}
                />
              </TabsContent>
              
              <TabsContent value="completed">
                <StaffClaimsTable 
                  statuses={["supervisor_approval", "approved", "rejected"]} 
                  showActions={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReviewClaims;
