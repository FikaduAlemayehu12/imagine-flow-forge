 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 interface CreateStaffRequest {
   email: string;
   password: string;
   fullName: string;
   role: string;
   branchId?: string;
 }
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Get admin authorization
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(
         JSON.stringify({ error: "Missing authorization header" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create admin client with service role
     const supabaseAdmin = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
       { auth: { autoRefreshToken: false, persistSession: false } }
     );
 
     // Create regular client to verify the caller is an admin
     const supabaseClient = createClient(
       Deno.env.get("SUPABASE_URL") ?? "",
       Deno.env.get("SUPABASE_ANON_KEY") ?? "",
       {
         global: { headers: { Authorization: authHeader } },
         auth: { autoRefreshToken: false, persistSession: false },
       }
     );
 
     // Get the calling user
     const { data: { user: callingUser }, error: userError } = await supabaseClient.auth.getUser();
     if (userError || !callingUser) {
       return new Response(
         JSON.stringify({ error: "Unauthorized" }),
         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Check if caller has admin or super_admin role
     const { data: roleData, error: roleError } = await supabaseAdmin
       .from("user_roles")
       .select("role")
       .eq("user_id", callingUser.id)
       .maybeSingle();
 
     if (roleError || !roleData || !["admin", "super_admin"].includes(roleData.role)) {
       return new Response(
         JSON.stringify({ error: "Only admins can create staff accounts" }),
         { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Parse request body
     const body: CreateStaffRequest = await req.json();
     const { email, password, fullName, role, branchId } = body;
 
     // Validate required fields
     if (!email || !password || !fullName || !role) {
       return new Response(
         JSON.stringify({ error: "Missing required fields: email, password, fullName, role" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Validate password length
     if (password.length < 6) {
       return new Response(
         JSON.stringify({ error: "Password must be at least 6 characters" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Create the user using admin API
     const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
       email,
       password,
       email_confirm: true, // Auto-confirm email for staff accounts
       user_metadata: { full_name: fullName },
     });
 
     if (createError) {
       return new Response(
         JSON.stringify({ error: createError.message }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Update the user's role (trigger creates default taxpayer role, so we update it)
     const { error: updateRoleError } = await supabaseAdmin
       .from("user_roles")
       .update({ 
         role, 
         branch_id: branchId || null,
         assigned_by: callingUser.id,
         assigned_at: new Date().toISOString()
       })
       .eq("user_id", newUser.user.id);
 
     if (updateRoleError) {
       // If role update fails, still return success but note it
       console.error("Failed to update role:", updateRoleError);
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         user: { 
           id: newUser.user.id, 
           email: newUser.user.email,
           fullName
         } 
       }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
 
   } catch (error) {
     console.error("Error creating staff account:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
     return new Response(
      JSON.stringify({ error: errorMessage }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });