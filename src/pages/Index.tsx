import Layout from "@/components/Layout";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import TaxpayerDashboard from "@/components/dashboards/TaxpayerDashboard";
import OfficerDashboard from "@/components/dashboards/OfficerDashboard";
import SupervisorDashboard from "@/components/dashboards/SupervisorDashboard";
import AuditorDashboard from "@/components/dashboards/AuditorDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: userRole, isLoading } = useUserRole();

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    const role: AppRole = userRole?.role || "taxpayer";

    switch (role) {
      case "officer":
        return <OfficerDashboard />;
      case "supervisor":
        return <SupervisorDashboard />;
      case "auditor":
        return <AuditorDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "risk_analyst":
        return <OfficerDashboard />; // Risk analysts use similar view to officers
      case "taxpayer":
      default:
        return <TaxpayerDashboard />;
    }
  };

  return <Layout>{renderDashboard()}</Layout>;
};

export default Index;
