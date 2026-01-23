import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, UserPlus, Shield, CheckCircle2, Building2, Users } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginType, setLoginType] = useState<"staff" | "taxpayer">("staff");

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateField = (field: string, value: string) => {
    try {
      if (field === "email") {
        emailSchema.parse(value);
      } else if (field === "password") {
        passwordSchema.parse(value);
      } else if (field === "name") {
        nameSchema.parse(value);
      }
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const emailValid = validateField("loginEmail", loginEmail);
    const passwordValid = validateField("loginPassword", loginPassword);
    
    if (!emailValid || !passwordValid) return;
    
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const nameValid = validateField("signupName", signupName);
    const emailValid = validateField("signupEmail", signupEmail);
    const passwordValid = validateField("signupPassword", signupPassword);
    
    if (!nameValid || !emailValid || !passwordValid) return;
    
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully.",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Ethiopian Flag Stripe */}
      <div className="ethiopian-stripe w-full" />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-4xl">🇪🇹</span>
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4">
              Ministry of Revenues
            </h1>
            <p className="text-xl text-sidebar-foreground/80 mb-8">
              VAT & Tax Refund System
            </p>
            
            <div className="space-y-4 text-left bg-sidebar-accent/30 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Fast Processing</p>
                  <p className="text-sm text-sidebar-foreground/70">Track your claims in real-time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Secure & Compliant</p>
                  <p className="text-sm text-sidebar-foreground/70">Bank-grade security standards</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Digital Documentation</p>
                  <p className="text-sm text-sidebar-foreground/70">Paperless claim submissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background via-background to-primary/5">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">🇪🇹</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-foreground">
                Ministry of Revenues
              </h1>
              <p className="text-sm text-muted-foreground">
                VAT & Tax Refund System
              </p>
            </div>
          </div>

          {/* Login Type Selector */}
          <div className="w-full max-w-md mb-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={loginType === "staff" ? "default" : "outline"}
                className="h-14 flex-col gap-1"
                onClick={() => setLoginType("staff")}
              >
                <Building2 className="h-5 w-5" />
                <span className="text-xs">Staff Portal</span>
              </Button>
              <Button
                variant={loginType === "taxpayer" ? "default" : "outline"}
                className="h-14 flex-col gap-1"
                onClick={() => setLoginType("taxpayer")}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs">Taxpayer Portal</span>
              </Button>
            </div>
          </div>

          <Card className="w-full max-w-md border-border shadow-xl">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="login" className="text-sm font-medium">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-medium">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-serif">
                    {loginType === "staff" ? "Staff Login" : "Taxpayer Login"}
                  </CardTitle>
                  <CardDescription>
                    {loginType === "staff" 
                      ? "Enter your staff credentials to access the system"
                      : "Sign in to manage your VAT refund claims"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={loginType === "staff" ? "staff@mor.gov.et" : "your@email.com"}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-11"
                      />
                      {errors.loginEmail && (
                        <p className="text-sm text-destructive">{errors.loginEmail}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-11"
                      />
                      {errors.loginPassword && (
                        <p className="text-sm text-destructive">{errors.loginPassword}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <LogIn className="h-5 w-5 mr-2" />
                      )}
                      Sign In
                    </Button>
                  </form>
                  
                  {loginType === "staff" && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">Demo Accounts:</p>
                      <div className="text-xs space-y-1">
                        <p><strong>Admin:</strong> admin@mor.gov.com</p>
                        <p><strong>Officer:</strong> admin@mor.gov.et</p>
                        <p><strong>Supervisor:</strong> moradmin@mor.gov.et</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </TabsContent>
              
              <TabsContent value="signup">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-2xl font-serif">
                    {loginType === "staff" ? "Staff Registration" : "Create Taxpayer Account"}
                  </CardTitle>
                  <CardDescription>
                    {loginType === "staff" 
                      ? "Contact your administrator for staff account creation"
                      : "Register to start managing your VAT refunds"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loginType === "staff" ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Staff accounts are managed by system administrators.
                        Please contact your supervisor for access.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Abebe Kebede"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          disabled={isLoading}
                          className="h-11"
                        />
                        {errors.signupName && (
                          <p className="text-sm text-destructive">{errors.signupName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="name@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          disabled={isLoading}
                          className="h-11"
                        />
                        {errors.signupEmail && (
                          <p className="text-sm text-destructive">{errors.signupEmail}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          disabled={isLoading}
                          className="h-11"
                        />
                        {errors.signupPassword && (
                          <p className="text-sm text-destructive">{errors.signupPassword}</p>
                        )}
                      </div>
                      <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-5 w-5 mr-2" />
                        )}
                        Create Taxpayer Account
                      </Button>
                    </form>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <p className="mt-8 text-sm text-muted-foreground text-center max-w-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Government of Ethiopia © 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
