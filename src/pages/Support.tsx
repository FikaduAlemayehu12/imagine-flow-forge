import { Phone, Mail, MapPin, Clock, MessageSquare, FileQuestion, BookOpen, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SupportChannels from "@/components/SupportChannels";
import ClaimTrackingCard from "@/components/ClaimTrackingCard";

const Support = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      value: "+251 11 662 98 00",
      description: "P.O. Box: 2559 Addis Ababa, Ethiopia",
    },
    {
      icon: Mail,
      title: "Email Support",
      value: "info.mor@mor.gov.et",
      description: "We respond within 24-48 hours",
    },
    {
      icon: MapPin,
      title: "Head Office",
      value: "Addis Ababa, Ethiopia",
      description: "Megenagna 24 condominium near to Lancet Hospital, MoR Building",
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon-Fri: 2:00-11:00 | Sat: ከ2:00-6:00",
      description: "Local Time • Closed on public holidays",
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

        {/* Multi-channel Support */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Contact Us Instantly</h2>
          <SupportChannels />
        </div>

        {/* Track Claim */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ClaimTrackingCard />
          
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Quick Links</CardTitle>
              <CardDescription>Helpful resources and guides</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { icon: MessageSquare, label: "Live Chat", desc: "Chat with us" },
                { icon: FileQuestion, label: "FAQs", desc: "Common questions" },
                { icon: BookOpen, label: "User Guide", desc: "Step-by-step help" },
                { icon: ExternalLink, label: "Resources", desc: "Forms & docs" },
              ].map((item, index) => (
                <div key={index} className="p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Office Location Map */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Our Location</CardTitle>
            <CardDescription>Visit us at Megenagna, Addis Ababa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px] rounded-lg overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d38.8!3d9.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sMegenagna%2C%20Addis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="MoR Office Location - Megenagna, Addis Ababa"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              📍 Megenagna 24 Condominium, near Lancet Hospital, Addis Ababa
            </p>
          </CardContent>
        </Card>

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
