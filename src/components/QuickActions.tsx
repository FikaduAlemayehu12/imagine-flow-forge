import { FileText, ClipboardList, HelpCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const QuickActions = () => {
  const actions = [
    {
      icon: FileText,
      title: "Submit New Claim",
      description: "File a VAT refund request",
      href: "/claims",
    },
    {
      icon: ClipboardList,
      title: "View VAT Returns",
      description: "Check your submitted returns",
      href: "/history",
    },
    {
      icon: Download,
      title: "Download Reports",
      description: "Export refund history",
      href: "/history",
    },
    {
      icon: HelpCircle,
      title: "Get Support",
      description: "Contact MoR assistance",
      href: "/support",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {actions.map((action, index) => (
        <Link key={index} to={action.href}>
          <Card className="border-border card-hover cursor-pointer group h-full">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-xs md:text-sm mb-0.5 md:mb-1">{action.title}</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
