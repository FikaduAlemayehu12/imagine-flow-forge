import { Bell, User, Menu, LogOut, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications as useNotificationsQuery } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole, AppRole, roleConfig } from "@/hooks/useUserRole";
import RoleBadge from "@/components/RoleBadge";

interface NavLink {
  href: string;
  label: string;
}

const getNavLinks = (role: AppRole): NavLink[] => {
  switch (role) {
    case "taxpayer":
      // Taxpayers only see: Apply Refund and Track Status
      return [
        { href: "/", label: "Dashboard" },
        { href: "/claims", label: "Apply Refund" },
        { href: "/support", label: "Track Status" },
      ];
    case "officer":
      return [
        { href: "/", label: "Dashboard" },
        { href: "/officer/review", label: "Review Claims" },
        { href: "/history", label: "History" },
        { href: "/support", label: "Support" },
      ];
    case "supervisor":
      return [
        { href: "/", label: "Dashboard" },
        { href: "/supervisor/approval", label: "Approvals" },
        { href: "/history", label: "History" },
        { href: "/support", label: "Support" },
      ];
    case "auditor":
      return [
        { href: "/", label: "Dashboard" },
        { href: "/auditor/queue", label: "Audit Queue" },
        { href: "/history", label: "History" },
        { href: "/support", label: "Support" },
      ];
    case "admin":
      // Admin has full access to everything
      return [
        { href: "/", label: "Dashboard" },
        { href: "/admin/users", label: "Users" },
        { href: "/claims", label: "Claims" },
        { href: "/history", label: "History" },
        { href: "/notifications", label: "Notifications" },
        { href: "/support", label: "Support" },
      ];
    case "risk_analyst":
      return [
        { href: "/", label: "Dashboard" },
        { href: "/officer/review", label: "Review Claims" },
        { href: "/history", label: "History" },
        { href: "/support", label: "Support" },
      ];
    default:
      return [{ href: "/", label: "Dashboard" }];
  }
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: notifications = [] } = useNotificationsQuery();
  const { signOut, user } = useAuth();
  const { data: userRole } = useUserRole();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const role: AppRole = userRole?.role || "taxpayer";
  const navLinks = getNavLinks(role);
  const config = roleConfig[role];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="w-full sticky top-0 z-50">
      {/* Ethiopian Flag Stripe */}
      <div className="ethiopian-stripe w-full" />
      
      {/* Main Header */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <Link to="/" className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <span className="text-xl md:text-2xl">🇪🇹</span>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-serif font-bold text-sidebar-foreground">
                  Ministry of Revenues
                </h1>
                <p className="text-xs md:text-sm text-sidebar-foreground/70 hidden sm:block">
                  VAT & Tax Refund System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors font-medium ${
                    isActive(link.href) ? "text-sidebar-primary border-b-2 border-sidebar-primary pb-1" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Role Badge - Desktop */}
              <div className="hidden md:block">
                <RoleBadge role={role} size="sm" />
              </div>

              {/* Notifications */}
              <Link to="/notifications">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent text-[10px] font-bold rounded-full flex items-center justify-center text-accent-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="mt-2">
                      <RoleBadge role={role} size="sm" />
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  {(role === "admin" || role === "supervisor") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-accent" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="lg:hidden text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-sidebar">
                  <div className="mt-4 mb-6 px-4">
                    <RoleBadge role={role} />
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${
                          isActive(link.href)
                            ? "bg-sidebar-primary/10 text-sidebar-primary"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-lg font-medium py-2 px-4 rounded-lg transition-colors text-accent hover:bg-sidebar-accent text-left mt-4"
                    >
                      Logout
                    </button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
