import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profile: Partial<TablesUpdate<"profiles">>) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useVerifyTIN = () => {
  return useMutation({
    mutationFn: async (tinNumber: string) => {
      // Simulate SIGTAS verification - in production this would call the actual API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Validate TIN format (10 digits)
      if (!/^\d{10}$/.test(tinNumber)) {
        throw new Error("Invalid TIN format. Must be exactly 10 digits.");
      }

      // Simulate fetching profile from SIGTAS
      const mockSIGTASData = {
        tin_number: tinNumber,
        business_name: `Business ${tinNumber.slice(-4)}`,
        business_address: "Addis Ababa, Ethiopia",
        business_category: "Manufacturing",
        verified: true,
      };

      return mockSIGTASData;
    },
  });
};
