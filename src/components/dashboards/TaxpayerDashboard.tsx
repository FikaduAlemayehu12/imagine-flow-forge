import { FileText, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TaxpayerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-8 px-4">
      {/* Welcome Section */}
      <div className="text-center mb-10 animate-fade-in max-w-2xl">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl">🇪🇹</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Welcome to Ministry of Revenues
        </h1>
        <p className="text-lg text-muted-foreground">
          VAT & Tax Refund System
        </p>
        {user?.user_metadata?.full_name && (
          <p className="text-muted-foreground mt-2">
            Hello, <span className="font-medium text-foreground">{user.user_metadata.full_name}</span>
          </p>
        )}
      </div>

      {/* Two Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {/* Apply Refund Card */}
        <Link to="/claims" className="block">
          <Card className="h-full border-border card-hover cursor-pointer group transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="font-serif text-xl">Apply for Refund</CardTitle>
              <CardDescription className="text-base">
                Submit your VAT refund claim with TIN verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Enter your 10-digit TIN number
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Verify with OTP (SMS/Email)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Submit claim with supporting documents
                </li>
              </ul>
              <Button className="w-full group-hover:bg-primary/90">
                Start Application <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        {/* Track Status Card */}
        <Link to="/support" className="block">
          <Card className="h-full border-border card-hover cursor-pointer group transition-all hover:border-primary/50 hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-16 h-16 mb-4 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-secondary/70 transition-colors">
                <Search className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="font-serif text-xl">Track Claim Status</CardTitle>
              <CardDescription className="text-base">
                Check the progress of your refund application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground/50"></span>
                  Enter your tracking number
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground/50"></span>
                  View real-time status updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-foreground/50"></span>
                  Download tracking receipt (PDF)
                </li>
              </ul>
              <Button variant="secondary" className="w-full">
                Track Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Help Text */}
      <p className="text-center text-sm text-muted-foreground mt-8 max-w-md animate-fade-in" style={{ animationDelay: "0.2s" }}>
        Need help? Contact our support team at <span className="font-medium">+251 11 662 98 00</span> or email <span className="font-medium">info.mor@mor.gov.et</span>
      </p>
    </div>
  );
};

export default TaxpayerDashboard;
