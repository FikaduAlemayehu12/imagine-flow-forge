 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { Tables } from "@/integrations/supabase/types";
 
 export type Branch = Tables<"branches">;
 
 export const useBranches = () => {
   return useQuery({
     queryKey: ["branches"],
     queryFn: async (): Promise<Branch[]> => {
       const { data, error } = await supabase
         .from("branches")
         .select("*")
         .eq("is_active", true)
         .order("branch_name");
 
       if (error) throw error;
       return data || [];
     },
   });
 };