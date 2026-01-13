import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger";
}

const StatusCard = ({ title, value, subtitle, icon: Icon, variant = "default" }: StatusCardProps) => {
  const variantStyles = {
    default: "bg-card border-border",
    success: "bg-primary/5 border-primary/20",
    warning: "bg-secondary/10 border-secondary/30",
    danger: "bg-accent/5 border-accent/20",
  };

  const iconStyles = {
    default: "bg-muted text-foreground",
    success: "bg-primary/15 text-primary",
    warning: "bg-secondary/20 text-secondary-foreground",
    danger: "bg-accent/15 text-accent",
  };

  return (
    <Card className={`${variantStyles[variant]} border card-hover`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
