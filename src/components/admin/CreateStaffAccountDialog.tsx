 import { useState } from "react";
 import { Loader2, UserPlus } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { useCreateStaffAccount, AppRole } from "@/hooks/useAdminRoles";
 import { useBranches } from "@/hooks/useBranches";
 import { roleConfig } from "@/hooks/useUserRole";
 
 const staffRoles: AppRole[] = ["officer", "supervisor", "risk_analyst", "auditor", "admin", "super_admin", "branch_staff"];
 
 interface CreateStaffAccountDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 const CreateStaffAccountDialog = ({ open, onOpenChange }: CreateStaffAccountDialogProps) => {
   const createStaffAccount = useCreateStaffAccount();
   const { data: branches = [] } = useBranches();
   
   const [formData, setFormData] = useState({
     email: "",
     password: "",
     confirmPassword: "",
     fullName: "",
     role: "" as AppRole | "",
     branchId: "",
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const validateForm = () => {
     const newErrors: Record<string, string> = {};
     
     if (!formData.email.trim()) {
       newErrors.email = "Email is required";
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
       newErrors.email = "Invalid email format";
     }
     
     if (!formData.password) {
       newErrors.password = "Password is required";
     } else if (formData.password.length < 6) {
       newErrors.password = "Password must be at least 6 characters";
     }
     
     if (formData.password !== formData.confirmPassword) {
       newErrors.confirmPassword = "Passwords do not match";
     }
     
     if (!formData.fullName.trim()) {
       newErrors.fullName = "Full name is required";
     }
     
     if (!formData.role) {
       newErrors.role = "Role is required";
     }
     
     // Branch is required for branch_staff role
     if (formData.role === "branch_staff" && !formData.branchId) {
       newErrors.branchId = "Branch is required for Branch Staff";
     }
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = () => {
     if (!validateForm()) return;
     
     createStaffAccount.mutate(
       {
         email: formData.email,
         password: formData.password,
         fullName: formData.fullName,
         role: formData.role as AppRole,
         branchId: formData.branchId || undefined,
       },
       {
         onSuccess: () => {
           onOpenChange(false);
           setFormData({
             email: "",
             password: "",
             confirmPassword: "",
             fullName: "",
             role: "",
             branchId: "",
           });
           setErrors({});
         },
       }
     );
   };
 
   const handleClose = () => {
     onOpenChange(false);
     setFormData({
       email: "",
       password: "",
       confirmPassword: "",
       fullName: "",
       role: "",
       branchId: "",
     });
     setErrors({});
   };
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <UserPlus className="h-5 w-5 text-primary" />
             Create Staff Account
           </DialogTitle>
           <DialogDescription>
             Create a new staff account. The user will be able to login immediately with these credentials.
           </DialogDescription>
         </DialogHeader>
         
         <div className="space-y-4 py-4">
           {/* Full Name */}
           <div className="space-y-2">
             <Label htmlFor="fullName">Full Name *</Label>
             <Input
               id="fullName"
               placeholder="Enter full name"
               value={formData.fullName}
               onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
             />
             {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
           </div>
           
           {/* Email */}
           <div className="space-y-2">
             <Label htmlFor="email">Email *</Label>
             <Input
               id="email"
               type="email"
               placeholder="staff@mor.gov.et"
               value={formData.email}
               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
             />
             {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
           </div>
           
           {/* Password */}
           <div className="space-y-2">
             <Label htmlFor="password">Password *</Label>
             <Input
               id="password"
               type="password"
               placeholder="Minimum 6 characters"
               value={formData.password}
               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
             />
             {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
           </div>
           
           {/* Confirm Password */}
           <div className="space-y-2">
             <Label htmlFor="confirmPassword">Confirm Password *</Label>
             <Input
               id="confirmPassword"
               type="password"
               placeholder="Confirm password"
               value={formData.confirmPassword}
               onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
             />
             {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
           </div>
           
           {/* Role */}
           <div className="space-y-2">
             <Label>Role *</Label>
             <Select
               value={formData.role}
               onValueChange={(value) => setFormData({ ...formData, role: value as AppRole })}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Select a role" />
               </SelectTrigger>
               <SelectContent>
                 {staffRoles.map((role) => (
                   <SelectItem key={role} value={role}>
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${roleConfig[role].bgColor}`} />
                       {roleConfig[role].label}
                     </div>
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
           </div>
           
           {/* Branch (shown for branch_staff or optionally for others) */}
           {(formData.role === "branch_staff" || formData.role === "officer") && (
             <div className="space-y-2">
               <Label>Branch {formData.role === "branch_staff" ? "*" : "(Optional)"}</Label>
               <Select
                 value={formData.branchId}
                 onValueChange={(value) => setFormData({ ...formData, branchId: value })}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select a branch" />
                 </SelectTrigger>
                 <SelectContent>
                   {branches.map((branch) => (
                     <SelectItem key={branch.id} value={branch.id}>
                       {branch.branch_name} ({branch.region})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {errors.branchId && <p className="text-xs text-destructive">{errors.branchId}</p>}
             </div>
           )}
         </div>
         
         <DialogFooter>
           <Button variant="outline" onClick={handleClose}>
             Cancel
           </Button>
           <Button
             onClick={handleSubmit}
             disabled={createStaffAccount.isPending}
           >
             {createStaffAccount.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
             Create Account
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default CreateStaffAccountDialog;