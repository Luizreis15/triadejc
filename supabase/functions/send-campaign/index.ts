import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: { user: requestingUser }, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Apenas admins podem enviar campanhas" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!resendKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendKey);
    const { campaignId } = await req.json();
    console.log("Starting campaign", { campaignId, admin: requestingUser.id });

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) throw new Error("Campaign not found");

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, is_active, created_at");

    let filtered: ProfileRow[] = (profiles ?? []) as ProfileRow[];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (campaign.segment === "active") {
      filtered = filtered.filter((p) => p.is_active !== false);
    } else if (campaign.segment === "inactive") {
      filtered = filtered.filter((p) => p.is_active === false);
    } else if (campaign.segment === "new") {
      filtered = filtered.filter((p) => p.created_at && new Date(p.created_at) >= thirtyDaysAgo);
    }

    let successCount = 0;

    for (const profile of filtered) {
      if (!profile.email) continue;
      try {
        const content = campaign.content_html
          .replace(/{nome}/g, profile.name || "Querida")
          .replace(/{email}/g, profile.email)
          .replace(/{link}/g, "https://www.jordanacantarelli.com.br/membros/app");

        await resend.emails.send({
          from: "Jordana Cantarelli <noreply@jordanacantarelli.com.br>",
          to: [profile.email],
          subject: campaign.subject.replace(/{nome}/g, profile.name || "Querida"),
          html: `<html><body style="font-family:Georgia,serif;color:#682A0C;max-width:600px;margin:0 auto;padding:20px;">${content}</body></html>`,
        });

        await supabaseAdmin.from("email_logs").insert({
          campaign_id: campaignId,
          user_id: profile.id,
          email: profile.email,
          status: "sent",
        });
        successCount++;
      } catch (err) {
        console.error("Failed campaign send", { email: profile.email, err });
      }
    }

    await supabaseAdmin
      .from("email_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: successCount,
      })
      .eq("id", campaignId);

    return new Response(JSON.stringify({ success: true, sent: successCount }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-campaign error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeadersFor(req) },
    });
  }
};

serve(handler);
