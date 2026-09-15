import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { verifyHmacSha256 } from "../_shared/crypto.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HUBLA_WEBHOOK_SECRET = Deno.env.get("HUBLA_WEBHOOK_SECRET");
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hubla-signature",
};

// Hubla webhook payload structure (based on actual webhook data)
interface HublaWebhookPayload {
  type: string;
  version: string;
  event: {
    product?: {
      id: string;
      name: string;
    };
    subscription?: {
      id: string;
      status: string;
      payer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
    };
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

const VALID_EVENTS = [
  "customer.member_added",
  "purchase.approved",
  "purchase.confirmed",
  "subscription.activated",
  "sale.approved",
];

// Paginates through auth.admin.listUsers() — never trust page 1 alone.
async function findUserIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  const perPage = 1000;
  const target = email.toLowerCase();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;
    if (data.users.length < perPage) return null;
  }
  return null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hubla-signature");

    // Fail-closed: missing header, missing secret, or bad signature -> 401.
    const signatureValid = await verifyHmacSha256(rawBody, signature, HUBLA_WEBHOOK_SECRET);
    if (!signatureValid) {
      console.error("hubla-webhook: rejected, missing or invalid signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    let payload: HublaWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const eventType = payload.type;

    // Priority: payer (who paid) > user (member added)
    const payer = payload.event?.subscription?.payer;
    const user = payload.event?.user;

    const customerEmail = payer?.email || user?.email;
    const customerFirstName = payer?.firstName || user?.firstName || "";
    const customerLastName = payer?.lastName || user?.lastName || "";
    const customerName = `${customerFirstName} ${customerLastName}`.trim();

    if (!customerEmail) {
      console.error("hubla-webhook: payload missing customer email");
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (!VALID_EVENTS.includes(eventType)) {
      console.log(`hubla-webhook: ignored event type=${eventType}`);
      return new Response(
        JSON.stringify({ message: `Event ${eventType} ignored` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const existingUserId = await findUserIdByEmail(supabaseAdmin, customerEmail);

    let userId: string;
    let isNewUser = false;
    let actionLink: string | undefined;

    if (existingUserId) {
      userId = existingUserId;
    } else {
      // Creates the user and returns a one-time action_link — no password ever set or transmitted.
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: "invite",
        email: customerEmail,
        options: {
          data: { name: customerName },
          redirectTo: "https://www.jordanacantarelli.com.br/membros/reset-password",
        },
      });

      if (error || !data?.user) {
        console.error("hubla-webhook: failed to create user", error?.message);
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }

      userId = data.user.id;
      isNewUser = true;
      actionLink = data.properties?.action_link;

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({ id: userId, email: customerEmail, name: customerName }, { onConflict: "id" });

      if (profileError) {
        console.error("hubla-webhook: profile upsert failed", profileError.message);
      }
    }

    // Welcome email only fires for a brand-new account — a replayed webhook
    // for an existing customer never resends it.
    if (isNewUser && actionLink) {
      const welcomeHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      };
      if (INTERNAL_FUNCTION_SECRET) {
        welcomeHeaders["x-internal-secret"] = INTERNAL_FUNCTION_SECRET;
      }

      const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: welcomeHeaders,
        body: JSON.stringify({
          name: customerName || customerEmail.split("@")[0],
          email: customerEmail,
          actionLink,
          loginUrl: "https://www.jordanacantarelli.com.br/membros",
        }),
      });

      if (!emailResponse.ok) {
        console.error("hubla-webhook: welcome email request failed", emailResponse.status);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isNewUser ? "User created and invite sent" : "User already exists, no email sent",
        userId,
        isNewUser,
        source: "hubla",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("hubla-webhook: unhandled error", message);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
