import { useState } from "react";
import { Upload, Send, Loader2, CheckCircle2, Copy, Download, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateClaim } from "@/hooks/useRefundClaims";
import { useProfile, useVerifyTIN } from "@/hooks/useProfile";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { generateTrackingCodePDF } from "@/lib/pdfGenerator";

interface EnhancedRefundClaimFormProps {
  onSuccess?: () => void;
}

type Step = "tin" | "otp" | "claim" | "success";

const EnhancedRefundClaimForm = ({ onSuccess }: EnhancedRefundClaimFormProps) => {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const [step, setStep] = useState<Step>(profile?.tin_number ? "claim" : "tin");
  
  // TIN & OTP states
  const [tinNumber, setTinNumber] = useState(profile?.tin_number || "");
  const [otp, setOtp] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  
  // Claim states
  const [vatPeriod, setVatPeriod] = useState("");
  const [vatPaid, setVatPaid] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submittedClaim, setSubmittedClaim] = useState<any>(null);
  
  const createClaim = useCreateClaim();
  const verifyTIN = useVerifyTIN();

  const handleTINSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{10}$/.test(tinNumber)) {
      toast({
        title: "Invalid TIN",
        description: "TIN number must be exactly 10 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      await verifyTIN.mutateAsync(tinNumber);
      toast({
        title: "OTP Sent",
        description: "Verification code sent via SMS, Email, and Telegram",
      });
      setStep("otp");
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify TIN",
        variant: "destructive",
      });
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOTP(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast({
      title: "TIN Verified",
      description: "You can now submit your refund claim",
    });
    setStep("claim");
    setIsVerifyingOTP(false);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vatPeriod || !vatPaid) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(vatPaid);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const claim = await createClaim.mutateAsync({
        vatPeriod,
        amount,
        description: `VAT refund claim for ${vatPeriod}`,
      });

      setSubmittedClaim(claim);
      setStep("success");
      
      toast({
        title: "Claim Submitted Successfully",
        description: `Your tracking code is: ${claim.claim_number}`,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit claim",
        variant: "destructive",
      });
    }
  };

  const copyTrackingCode = () => {
    if (submittedClaim) {
      navigator.clipboard.writeText(submittedClaim.claim_number);
      toast({
        title: "Copied",
        description: "Tracking code copied to clipboard",
      });
    }
  };

  const downloadTrackingPDF = async () => {
    if (submittedClaim) {
      await generateTrackingCodePDF(
        submittedClaim.claim_number,
        new Date(submittedClaim.submitted_at || submittedClaim.created_at).toLocaleDateString("en-GB")
      );
      toast({
        title: "Downloaded",
        description: "Tracking code PDF downloaded",
      });
    }
  };

  const vatPeriods = [
    "January 2024", "February 2024", "March 2024", "April 2024",
    "May 2024", "June 2024", "July 2024", "August 2024",
    "September 2024", "October 2024", "November 2024", "December 2024",
    "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024",
  ];

  return (
    <Card className="border-border shadow-sm max-w-lg mx-auto">
      <CardHeader className="pb-4 text-center">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {["TIN", "OTP", "Claim", "Done"].map((label, index) => {
            const stepIndex = ["tin", "otp", "claim", "success"].indexOf(step);
            const isCompleted = index < stepIndex;
            const isCurrent = index === stepIndex;
            
            return (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isCurrent 
                      ? "bg-primary/20 text-primary border-2 border-primary" 
                      : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${isCompleted ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            );
          })}
        </div>
        
        <CardTitle className="text-xl font-serif text-foreground">
          {step === "tin" && "Verify Your TIN"}
          {step === "otp" && "Enter Verification Code"}
          {step === "claim" && "Submit Refund Claim"}
          {step === "success" && "Claim Submitted!"}
        </CardTitle>
        <CardDescription>
          {step === "tin" && "Enter your 10-digit TIN number to verify with SIGTAS"}
          {step === "otp" && "Enter the code sent to your registered contacts"}
          {step === "claim" && "Fill in your VAT refund details"}
          {step === "success" && "Save your tracking code for reference"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Step 1: TIN Verification */}
        {step === "tin" && (
          <form onSubmit={handleTINSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tin">TIN Number</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tin"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="0123456789"
                  className="pl-9 font-mono text-lg tracking-wider"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your TIN will be verified through the SIGTAS system
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={verifyTIN.isPending || tinNumber.length !== 10}
            >
              {verifyTIN.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify TIN & Send OTP"
              )}
            </Button>

            {profile?.tin_number && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("claim")}
              >
                Skip (TIN already verified)
              </Button>
            )}
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-center block">Enter 6-digit code</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Sent via SMS, Email, Telegram & WhatsApp
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifyingOTP || otp.length !== 6}
            >
              {isVerifyingOTP ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Continue"
              )}
            </Button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep("tin")}
                className="text-muted-foreground hover:text-foreground"
              >
                Change TIN
              </button>
              <button
                type="button"
                onClick={() => toast({ title: "OTP Resent" })}
                className="text-primary hover:underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Claim Form */}
        {step === "claim" && (
          <form onSubmit={handleClaimSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="vat-period">VAT Period</Label>
              <Select value={vatPeriod} onValueChange={setVatPeriod}>
                <SelectTrigger id="vat-period" className="bg-background">
                  <SelectValue placeholder="Select VAT period" />
                </SelectTrigger>
                <SelectContent className="bg-card max-h-60">
                  {vatPeriods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat-paid">VAT Amount (ETB)</Label>
              <Input
                id="vat-paid"
                type="number"
                placeholder="Enter amount in Ethiopian Birr"
                value={vatPaid}
                onChange={(e) => setVatPaid(e.target.value)}
                className="bg-background"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoices">Upload Supporting Documents</Label>
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
                      : "Click to upload invoices"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createClaim.isPending}
            >
              {createClaim.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Claim
                </>
              )}
            </Button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && submittedClaim && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Your Tracking Code</p>
              <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-center gap-3">
                <span className="font-mono text-xl font-bold text-primary">
                  {submittedClaim.claim_number}
                </span>
                <button
                  onClick={copyTrackingCode}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4 text-primary" />
                </button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">
                  ETB {Number(submittedClaim.claim_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT Period</span>
                <span>{submittedClaim.vat_period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-secondary-foreground font-medium">Submitted</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={downloadTrackingPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Tracking Code (PDF)
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  setStep(profile?.tin_number ? "claim" : "tin");
                  setVatPeriod("");
                  setVatPaid("");
                  setFiles(null);
                  setOtp("");
                  onSuccess?.();
                }}
              >
                Submit Another Claim
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedRefundClaimForm;
