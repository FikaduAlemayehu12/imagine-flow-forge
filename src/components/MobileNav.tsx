import { Home, FileText, Clock, HelpCircle, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useNotifications } from "@/data/mockData";

const MobileNav = () => {
  const location = useLocation();
  const notifications = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Claims", path: "/claims" },
    { icon: Clock, label: "History", path: "/history" },
    { icon: Bell, label: "Alerts", path: "/notifications", badge: unreadCount },
    { icon: HelpCircle, label: "Support", path: "/support" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-sidebar border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative ${
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              }`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-accent text-[10px] font-bold rounded-full flex items-center justify-center text-accent-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
