import { DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import RefundClaimForm from "@/components/RefundClaimForm";
import RefundsTable from "@/components/RefundsTable";
import QuickActions from "@/components/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
            Welcome Back, Taxpayer
          </h2>
          <p className="text-muted-foreground">
            Track your VAT refund claims and manage your tax records
          </p>
        </div>

        {/* Quick Actions */}
        <section className="mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <QuickActions />
        </section>

        {/* Status Overview Cards */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Refund Status Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
              <StatusCard
                title="Total Claims"
                value="12"
                subtitle="All time submissions"
                icon={DollarSign}
                variant="default"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <StatusCard
                title="Pending Review"
                value="3"
                subtitle="Awaiting approval"
                icon={Clock}
                variant="warning"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <StatusCard
                title="Approved"
                value="8"
                subtitle="ETB 450,000 total"
                icon={CheckCircle2}
                variant="success"
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <StatusCard
                title="Rejected"
                value="1"
                subtitle="Review required"
                icon={XCircle}
                variant="danger"
              />
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Refunds Table - Takes 2 columns */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "0.35s" }}>
            <RefundsTable />
          </div>

          {/* Submit Claim Form - Takes 1 column */}
          <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <RefundClaimForm />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 Ministry of Revenues – Ethiopia. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
