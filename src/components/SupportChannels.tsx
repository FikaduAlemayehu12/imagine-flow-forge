import { Phone, Mail, MessageCircle, Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SupportChannels = () => {
  const channels = [
    {
      icon: Send,
      name: "Telegram",
      description: "Chat with us on Telegram",
      primary: "@fikadu_alemayehu",
      secondary: "@NetLink_General_Solutions",
      color: "bg-[hsl(200,80%,50%)]",
      links: [
        { label: "@fikadu_alemayehu", url: "https://t.me/fikadu_alemayehu" },
        { label: "@NetLink_General_Solutions", url: "https://t.me/NetLink_General_Solutions" },
      ],
    },
    {
      icon: MessageCircle,
      name: "WhatsApp",
      description: "Message us on WhatsApp",
      primary: "+251 916 690 051",
      secondary: "+251 913 671 010",
      color: "bg-[hsl(145,70%,45%)]",
      links: [
        { label: "+251 916 690 051", url: "https://wa.me/251916690051" },
        { label: "+251 913 671 010", url: "https://wa.me/251913671010" },
      ],
    },
    {
      icon: Phone,
      name: "Phone / SMS",
      description: "Call or text us directly",
      primary: "+251 916 690 051",
      secondary: "+251 913 671 010",
      color: "bg-[hsl(215,80%,50%)]",
      links: [
        { label: "+251 916 690 051", url: "tel:+251916690051" },
        { label: "+251 913 671 010", url: "tel:+251913671010" },
      ],
    },
    {
      icon: Mail,
      name: "Email",
      description: "Send us an email",
      primary: "support@mor.gov.et",
      secondary: "help@mor.gov.et",
      color: "bg-[hsl(0,70%,50%)]",
      links: [
        { label: "support@mor.gov.et", url: "mailto:support@mor.gov.et" },
        { label: "help@mor.gov.et", url: "mailto:help@mor.gov.et" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {channels.map((channel) => (
        <Card key={channel.name} className="card-hover group overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${channel.color} text-white`}>
                <channel.icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">{channel.name}</CardTitle>
                <CardDescription className="text-xs">{channel.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {channel.links.map((link, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-normal hover:bg-primary/5 hover:border-primary/30"
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SupportChannels;
