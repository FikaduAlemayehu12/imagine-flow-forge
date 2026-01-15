import { useState, useEffect } from "react";
import { User, Building2, Phone, Mail, MapPin, Save, Loader2, Pencil, Shield } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserRole, roleConfig } from "@/hooks/useUserRole";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { toast } = useToast();
  const { data: profile, isLoading } = useProfile();
  const { data: userRole } = useUserRole();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    business_name: "",
    business_address: "",
    business_category: "",
    tin_number: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        business_name: profile.business_name || "",
        business_address: profile.business_address || "",
        business_category: profile.business_category || "",
        tin_number: profile.tin_number || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync({
        full_name: formData.full_name,
        phone: formData.phone,
        business_name: formData.business_name,
        business_address: formData.business_address,
        business_category: formData.business_category,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const businessCategories = [
    "Manufacturing",
    "Retail Trade",
    "Wholesale Trade",
    "Services",
    "Construction",
    "Agriculture",
    "Mining",
    "Transport",
    "Financial Services",
    "Other",
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const roleInfo = userRole ? roleConfig[userRole.role] : null;

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage your account information
            </p>
          </div>
          
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Role Badge Card */}
        {roleInfo && (
          <Card className="border-l-4" style={{ borderLeftColor: roleInfo.color.replace('text-', 'var(--') }}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${roleInfo.bgColor}`}>
                <Shield className={`h-6 w-6 ${roleInfo.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className={`font-semibold ${roleInfo.color}`}>{roleInfo.label}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {profile?.registration_date 
                    ? new Date(profile.registration_date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={formData.email}
                      disabled
                      className="pl-9 bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+251 9XX XXX XXX"
                      disabled={!isEditing}
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tin_number">TIN Number</Label>
                  <Input
                    id="tin_number"
                    value={formData.tin_number}
                    disabled
                    className="bg-muted font-mono"
                  />
                  <p className="text-xs text-muted-foreground">TIN is verified through SIGTAS</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Business Information
                </CardTitle>
                <CardDescription>Your registered business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                    placeholder="Enter business name"
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_category">Business Category</Label>
                  <Select 
                    value={formData.business_category} 
                    onValueChange={(value) => setFormData({ ...formData, business_category: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_address">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="business_address"
                      value={formData.business_address}
                      onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                      placeholder="Enter business address"
                      disabled={!isEditing}
                      className="pl-9 bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <Card className="mt-6">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        full_name: profile.full_name || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        business_name: profile.business_name || "",
                        business_address: profile.business_address || "",
                        business_category: profile.business_category || "",
                        tin_number: profile.tin_number || "",
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
