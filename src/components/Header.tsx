import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="w-full">
      {/* Ethiopian Flag Stripe */}
      <div className="ethiopian-stripe w-full" />
      
      {/* Main Header */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-2xl">🇪🇹</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-serif font-bold text-sidebar-foreground">
                  Ministry of Revenues
                </h1>
                <p className="text-sm text-sidebar-foreground/70">
                  VAT & Tax Refund System
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors font-medium">
                Dashboard
              </a>
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors font-medium">
                Submit Claim
              </a>
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors font-medium">
                History
              </a>
              <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors font-medium">
                Support
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
