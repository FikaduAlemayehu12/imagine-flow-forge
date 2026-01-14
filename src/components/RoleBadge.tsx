import { Badge } from "@/components/ui/badge";
import { AppRole, roleConfig } from "@/hooks/useUserRole";

interface RoleBadgeProps {
  role: AppRole;
  size?: "sm" | "default";
}

const RoleBadge = ({ role, size = "default" }: RoleBadgeProps) => {
  const config = roleConfig[role];
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.bgColor} ${config.color} border ${size === "sm" ? "text-xs px-2 py-0" : ""}`}
    >
      {config.label}
    </Badge>
  );
};

export default RoleBadge;
