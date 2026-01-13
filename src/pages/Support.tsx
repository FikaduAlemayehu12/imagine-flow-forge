import { Phone, Mail, MapPin, Clock, MessageSquare, FileQuestion, BookOpen, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Support = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      value: "+251 11 551 7788",
      description: "Monday - Friday, 8:00 AM - 5:00 PM",
    },
    {
      icon: Mail,
      title: "Email Support",
      value: "support@mor.gov.et",
      description: "Response within 24-48 hours",
    },
    {
      icon: MapPin,
      title: "Head Office",
      value: "Addis Ababa, Ethiopia",
      description: "Mexico Square, Bole Road",
    },
    {
      icon: Clock,
      title: "Working Hours",
      value: "8:00 AM - 5:00 PM",
      description: "Monday to Friday (EAT)",
    },
  ];

  const faqs = [
    {
      question: "How long does it take to process a VAT refund claim?",
      answer: "Typically, VAT refund claims are processed within 30-45 business days from the date of submission, provided all documentation is complete and accurate.",
    },
    {
      question: "What documents are required for a refund claim?",
      answer: "Required documents include: valid tax invoice copies, proof of payment, bank statements showing transactions, TIN certificate, and business license. Additional documents may be requested based on claim type.",
    },
    {
      question: "Why was my claim rejected?",
      answer: "Claims may be rejected due to incomplete documentation, discrepancies in reported amounts, expired invoices, or non-compliance with VAT regulations. Check your notification for specific reasons.",
    },
    {
      question: "Can I appeal a rejected claim?",
      answer: "Yes, you can appeal a rejected claim within 30 days of receiving the rejection notice. Submit additional supporting documents and a written appeal through the portal or at any MoR office.",
    },
    {
      question: "How do I track my refund payment?",
      answer: "Once approved, refunds are typically deposited within 5-10 business days. You can track the payment status in the History section or contact our support team with your claim ID.",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Help & Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Get assistance with your VAT refund claims and tax inquiries
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: "Live Chat", desc: "Chat with us" },
            { icon: FileQuestion, label: "FAQs", desc: "Common questions" },
            { icon: BookOpen, label: "User Guide", desc: "Step-by-step help" },
            { icon: ExternalLink, label: "Resources", desc: "Forms & docs" },
          ].map((item, index) => (
            <Card key={index} className="card-hover cursor-pointer group">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Contact Us</CardTitle>
              <CardDescription>Reach out through any of these channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{info.title}</p>
                    <p className="text-sm text-foreground">{info.value}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Send a Message</CardTitle>
              <CardDescription>We'll get back to you within 24-48 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <Input placeholder="Your full name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input type="email" placeholder="your@email.com" className="mt-1" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input placeholder="What's this about?" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea 
                    placeholder="Describe your issue or question in detail..." 
                    className="mt-1 min-h-[120px]" 
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common queries</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Support;
