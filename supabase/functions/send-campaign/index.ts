import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campaignId } = await req.json();
    console.log("Starting campaign:", campaignId);

    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) throw new Error("Campaign not found");

    const { data: profiles } = await supabase.from("profiles").select("id, name, email, is_active, created_at");

    let filtered = profiles || [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (campaign.segment === "active") filtered = filtered.filter((p: any) => p.is_active !== false);
    else if (campaign.segment === "inactive") filtered = filtered.filter((p: any) => p.is_active === false);
    else if (campaign.segment === "new") filtered = filtered.filter((p: any) => new Date(p.created_at) >= thirtyDaysAgo);

    let successCount = 0;

    for (const profile of filtered) {
      if (!profile.email) continue;
      try {
        const content = campaign.content_html
          .replace(/{nome}/g, profile.name || "Querida")
          .replace(/{email}/g, profile.email)
          .replace(/{link}/g, "https://traide.lovable.app/membrosvmcm/app");

        await resend.emails.send({
          from: "Jornada Única <noreply@resend.dev>",
          to: [profile.email],
          subject: campaign.subject.replace(/{nome}/g, profile.name || "Querida"),
          html: `<html><body style="font-family:Georgia,serif;color:#682A0C;max-width:600px;margin:0 auto;padding:20px;">${content}</body></html>`,
        });

        await supabase.from("email_logs").insert({ campaign_id: campaignId, user_id: profile.id, email: profile.email, status: "sent" });
        successCount++;
      } catch (e) {
        console.error(`Failed: ${profile.email}`, e);
      }
    }

    await supabase.from("email_campaigns").update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: successCount }).eq("id", campaignId);

    return new Response(JSON.stringify({ success: true, sent: successCount }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
