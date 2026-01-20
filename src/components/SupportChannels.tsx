import { Phone, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SupportChannels = () => {
  const channels = [
    {
      icon: Phone,
      name: "Toll-Free",
      description: "Call us free of charge",
      primary: "8199",
      color: "bg-[hsl(145,70%,40%)]",
      links: [
        { label: "8199", url: "tel:8199" },
      ],
      featured: true,
    },
    {
      icon: Send,
      name: "Telegram",
      description: "Join our official Telegram channel",
      primary: "@MoREthiopiaOfficial",
      color: "bg-[hsl(200,80%,50%)]",
      links: [
        { label: "@MoREthiopiaOfficial", url: "https://t.me/MoREthiopiaOfficial" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
