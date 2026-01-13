import { useState } from "react";
import { Upload, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { addRefund } from "@/data/mockData";

interface RefundClaimFormProps {
  onSuccess?: () => void;
}

const RefundClaimForm = ({ onSuccess }: RefundClaimFormProps) => {
  const { toast } = useToast();
  const [vatPeriod, setVatPeriod] = useState("");
  const [vatPaid, setVatPaid] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vatPeriod || !vatPaid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    addRefund({
      vatPeriod,
      amount: Number(vatPaid),
      submittedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      description: `VAT refund claim for ${vatPeriod}`,
    });

    toast({
      title: "Refund Claim Submitted",
      description: "Your VAT refund claim has been submitted successfully. You will receive updates via email.",
    });
    setVatPeriod("");
    setVatPaid("");
    setFiles(null);
    onSuccess?.();
  };

  const vatPeriods = [
    "January 2024",
    "February 2024",
    "March 2024",
    "April 2024",
    "May 2024",
    "June 2024",
    "Q1 2024",
    "Q2 2024",
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-serif text-foreground">Submit Refund Claim</CardTitle>
        <CardDescription>
          Submit your VAT refund request with supporting documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vat-period" className="text-sm font-medium">
              VAT Period
            </Label>
            <Select value={vatPeriod} onValueChange={setVatPeriod}>
              <SelectTrigger id="vat-period" className="bg-background">
                <SelectValue placeholder="Select VAT period" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                {vatPeriods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat-paid" className="text-sm font-medium">
              VAT Paid (ETB)
            </Label>
            <Input
              id="vat-paid"
              type="number"
              placeholder="Enter amount in Ethiopian Birr"
              value={vatPaid}
              onChange={(e) => setVatPaid(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoices" className="text-sm font-medium">
              Upload Invoices
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
              <input
                id="invoices"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFiles(e.target.files)}
              />
              <label htmlFor="invoices" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {files && files.length > 0
                    ? `${files.length} file(s) selected`
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Send className="h-4 w-4 mr-2" />
            Submit Claim
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RefundClaimForm;
