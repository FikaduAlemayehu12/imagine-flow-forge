import { FileText, ClipboardList, HelpCircle, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const QuickActions = () => {
  const actions = [
    {
      icon: FileText,
      title: "Submit New Claim",
      description: "File a VAT refund request",
      href: "#",
    },
    {
      icon: ClipboardList,
      title: "View VAT Returns",
      description: "Check your submitted returns",
      href: "#",
    },
    {
      icon: Download,
      title: "Download Reports",
      description: "Export refund history",
      href: "#",
    },
    {
      icon: HelpCircle,
      title: "Get Support",
      description: "Contact MoR assistance",
      href: "#",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <a key={index} href={action.href}>
          <Card className="border-border card-hover cursor-pointer group">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <action.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium text-foreground text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
};

export default QuickActions;
