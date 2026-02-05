import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_at: string;
}

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user_role", user?.id],
    queryFn: async (): Promise<UserRole | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useIsStaff = () => {
  const { data: userRole } = useUserRole();
  const staffRoles: AppRole[] = ["officer", "supervisor", "risk_analyst", "auditor", "admin"];
  return userRole ? staffRoles.includes(userRole.role) : false;
};

export const useHasRole = (role: AppRole) => {
  const { data: userRole } = useUserRole();
  return userRole?.role === role;
};

// Role display names and colors
export const roleConfig: Record<AppRole, { label: string; color: string; bgColor: string }> = {
  taxpayer: { label: "Taxpayer", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200" },
  officer: { label: "MoR Officer", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  supervisor: { label: "Supervisor", color: "text-purple-700", bgColor: "bg-purple-50 border-purple-200" },
  risk_analyst: { label: "Risk Analyst", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  auditor: { label: "Auditor", color: "text-indigo-700", bgColor: "bg-indigo-50 border-indigo-200" },
  admin: { label: "Administrator", color: "text-rose-700", bgColor: "bg-rose-50 border-rose-200" },
  super_admin: { label: "Super Admin", color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
  branch_staff: { label: "Branch Staff", color: "text-teal-700", bgColor: "bg-teal-50 border-teal-200" },
};
