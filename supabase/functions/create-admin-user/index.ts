import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://www.jordanacantarelli.com.br",
  "https://jordanacantarelli.com.br",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
];

function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if requesting user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Apenas admins podem criar usuários" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const { email, name, makeAdmin } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error: createError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        data: { name },
        redirectTo: "https://www.jordanacantarelli.com.br/membros/reset-password",
      },
    });

    if (createError || !data?.user) {
      console.error("Error creating user:", createError?.message);
      return new Response(
        JSON.stringify({ error: createError?.message || "Falha ao criar usuário" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUser = data;
    const actionLink = data.properties?.action_link;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUser.user.id,
        email,
        name,
        is_active: true,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError.message);
      // Don't fail if profile already exists
    }

    const { data: defaultProduct } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("slug", "jornada_unica")
      .maybeSingle();

    if (defaultProduct?.id) {
      const { error: entitlementError } = await supabaseAdmin
        .from("entitlements")
        .upsert(
          {
            user_id: newUser.user.id,
            product_id: defaultProduct.id,
            status: "active",
            source: "admin",
          },
          { onConflict: "user_id,product_id" },
        );

      if (entitlementError) {
        console.error("Error granting entitlement:", entitlementError.message);
      }
    }

    // If makeAdmin is true, add admin role
    if (makeAdmin) {
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: "admin",
        });

      if (roleError) {
        console.error("Error adding admin role:", roleError);
      } else {
        console.log(`Admin role added for user: ${newUser.user.id}`);
      }
    }

    // Welcome via invite link — never send a password.
    let emailSent = false;
    if (actionLink) {
      try {
        const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET") ?? "";
        const welcomeHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        };
        if (internalSecret) {
          welcomeHeaders["x-internal-secret"] = internalSecret;
        }

        const welcomeResponse = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
          method: "POST",
          headers: welcomeHeaders,
          body: JSON.stringify({
            name: name || email.split("@")[0],
            email,
            actionLink,
            loginUrl: "https://www.jordanacantarelli.com.br/membros",
          }),
        });

        emailSent = welcomeResponse.ok;
        if (!welcomeResponse.ok) {
          console.error("Failed to send welcome email", welcomeResponse.status);
        }
      } catch (emailError) {
        const message = emailError instanceof Error ? emailError.message : "unknown";
        console.error("Error sending welcome email", message);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name,
        },
        emailSent,
        message: makeAdmin 
          ? `Usuário admin ${email} criado com sucesso!${emailSent ? " Email de boas-vindas enviado." : ""}`
          : `Usuário ${email} criado com sucesso!${emailSent ? " Email de boas-vindas enviado." : ""}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
