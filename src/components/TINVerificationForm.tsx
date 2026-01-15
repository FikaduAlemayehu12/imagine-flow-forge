import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useVerifyTIN, useUpdateProfile } from "@/hooks/useProfile";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface TINVerificationFormProps {
  onVerified: (data: {
    tin_number: string;
    business_name: string;
    business_address: string;
    business_category: string;
  }) => void;
  onSkip?: () => void;
}

const TINVerificationForm = ({ onVerified, onSkip }: TINVerificationFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"tin" | "otp" | "verified">("tin");
  const [tinNumber, setTinNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  
  const verifyTIN = useVerifyTIN();
  const updateProfile = useUpdateProfile();

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
      const data = await verifyTIN.mutateAsync(tinNumber);
      setVerifiedData(data);
      
      // Simulate sending OTP
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your registered phone and email.",
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
    
    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For demo, accept any 6-digit code
    if (otp.length === 6) {
      try {
        await updateProfile.mutateAsync({
          tin_number: verifiedData.tin_number,
          business_name: verifiedData.business_name,
          business_address: verifiedData.business_address,
          business_category: verifiedData.business_category,
        });

        setStep("verified");
        toast({
          title: "TIN Verified",
          description: "Your TIN has been verified and profile updated successfully.",
        });
        
        onVerified(verifiedData);
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Failed to update profile with verified data",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsVerifyingOTP(false);
  };

  const handleResendOTP = () => {
    toast({
      title: "OTP Resent",
      description: "A new verification code has been sent.",
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {step === "verified" ? (
            <CheckCircle2 className="h-6 w-6 text-primary" />
          ) : (
            <KeyRound className="h-6 w-6 text-primary" />
          )}
        </div>
        <CardTitle className="font-serif">
          {step === "tin" && "TIN Verification"}
          {step === "otp" && "Enter Verification Code"}
          {step === "verified" && "Verification Complete"}
        </CardTitle>
        <CardDescription>
          {step === "tin" && "Enter your 10-digit TIN number to verify with SIGTAS"}
          {step === "otp" && "We've sent a code to your registered phone and email"}
          {step === "verified" && "Your TIN has been verified successfully"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "tin" && (
          <form onSubmit={handleTINSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tin">TIN Number</Label>
              <Input
                id="tin"
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="0123456789"
                className="font-mono text-lg tracking-wider text-center"
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter your 10-digit Taxpayer Identification Number
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
                  Verifying with SIGTAS...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Verify TIN
                </>
              )}
            </Button>

            {onSkip && (
              <Button type="button" variant="ghost" className="w-full" onClick={onSkip}>
                Skip for now
              </Button>
            )}
          </form>
        )}

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
                Code sent via SMS, Email, and Telegram
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
                "Verify Code"
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep("tin")}
                className="text-muted-foreground hover:text-foreground"
              >
                Change TIN
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                className="text-primary hover:underline"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        {step === "verified" && (
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">TIN Number</span>
                <span className="font-mono font-medium">{verifiedData?.tin_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business Name</span>
                <span className="font-medium">{verifiedData?.business_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{verifiedData?.business_category}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4" />
              <span>Profile updated with SIGTAS data</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TINVerificationForm;
