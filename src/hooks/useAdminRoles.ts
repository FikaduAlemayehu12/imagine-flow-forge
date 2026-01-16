import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: AppRole | null;
  role_id: string | null;
}

export const useAllUsersWithRoles = () => {
  return useQuery({
    queryKey: ["all_users_with_roles"],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: userRole?.role || null,
          role_id: userRole?.id || null,
        };
      });

      return usersWithRoles;
    },
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Check if user already has a role
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingRole) {
        // Update existing role
        const { data, error } = await supabase
          .from("user_roles")
          .update({ role, assigned_at: new Date().toISOString() })
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new role
        const { data, error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_users_with_roles"] });
      queryClient.invalidateQueries({ queryKey: ["user_role"] });
      toast.success("Role assigned successfully");
    },
    onError: (error) => {
      toast.error("Failed to assign role: " + error.message);
    },
  });
};

export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_users_with_roles"] });
      queryClient.invalidateQueries({ queryKey: ["user_role"] });
      toast.success("Role removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove role: " + error.message);
    },
  });
};
