import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { verifyHmacSha256 } from "../_shared/crypto.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KIWIFY_WEBHOOK_TOKEN = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");

const DEFAULT_PRODUCT_SLUG = "jornada_unica";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kiwify-signature",
};

// Kiwify webhook payload structure
interface KiwifyWebhookPayload {
  order_id: string;
  order_status: string;
  webhook_event_type?: string;
  Customer: {
    email: string;
    first_name?: string;
    full_name?: string;
    mobile?: string;
  };
  Product?: {
    product_id: string;
    product_name: string;
    // Best-effort — Kiwify's real payload shape for price varies by event;
    // amount falls back to 0 when none of these are present (see extractAmount).
    price?: number;
  };
  Subscription?: {
    id: string;
    status: string;
  };
  // Best-effort locations for the charged amount across Kiwify event types.
  charge_amount?: number;
  amount?: number;
  Commissions?: { charge_amount?: number };
}

const VALID_EVENTS = [
  "order_approved",
  "order_paid",
  "paid",
  "subscription_created",
  "subscription_renewed",
  "subscription_reactivated",
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

// Reserves (or finds) the webhook_events row for this event, atomically enough
// to survive retries: a UNIQUE(provider, event_id) collision on insert is
// treated as "someone already has this", not an error.
async function claimWebhookEvent(
  admin: SupabaseClient,
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<{ rowId: string; alreadyProcessed: boolean }> {
  const { data: existing } = await admin
    .from("webhook_events")
    .select("id, status")
    .eq("provider", "kiwify")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    return { rowId: existing.id, alreadyProcessed: existing.status === "processed" };
  }

  const { data: inserted, error } = await admin
    .from("webhook_events")
    .insert({ provider: "kiwify", event_id: eventId, event_type: eventType, status: "received", payload })
    .select("id")
    .single();

  if (error) {
    // 23505 = unique_violation: another request claimed this event_id concurrently.
    if (error.code === "23505") {
      const { data: raceRow } = await admin
        .from("webhook_events")
        .select("id, status")
        .eq("provider", "kiwify")
        .eq("event_id", eventId)
        .single();
      if (raceRow) return { rowId: raceRow.id, alreadyProcessed: raceRow.status === "processed" };
    }
    throw error;
  }

  return { rowId: inserted.id, alreadyProcessed: false };
}

// Unknown/missing Kiwify SKU falls back to the single default product.
async function resolveProductId(admin: SupabaseClient, kiwifyProductId: string | undefined): Promise<string> {
  if (kiwifyProductId) {
    const { data } = await admin
      .from("products")
      .select("id")
      .eq("kiwify_product_id", kiwifyProductId)
      .maybeSingle();
    if (data) return data.id;
  }

  const { data: fallback, error } = await admin
    .from("products")
    .select("id")
    .eq("slug", DEFAULT_PRODUCT_SLUG)
    .single();

  if (error || !fallback) {
    throw new Error(`default product '${DEFAULT_PRODUCT_SLUG}' not found`);
  }
  return fallback.id;
}

function extractAmount(payload: KiwifyWebhookPayload): number {
  const raw = payload.Commissions?.charge_amount ?? payload.charge_amount ?? payload.amount ?? payload.Product?.price;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
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
    const signature = req.headers.get("x-kiwify-signature");

    // Fail-closed: missing header, missing secret, or bad signature -> 401.
    const signatureValid = await verifyHmacSha256(rawBody, signature, KIWIFY_WEBHOOK_TOKEN);
    if (!signatureValid) {
      console.error("kiwify-webhook: rejected, missing or invalid signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    let payload: KiwifyWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const eventType = payload.webhook_event_type || payload.order_status;
    const customerEmail = payload.Customer?.email;
    const customerName = payload.Customer?.full_name || payload.Customer?.first_name || "";

    if (!customerEmail) {
      console.error("kiwify-webhook: payload missing Customer.email");
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const isValidEvent = VALID_EVENTS.includes(eventType) || payload.order_status === "paid";
    if (!isValidEvent) {
      console.log(`kiwify-webhook: ignored event type=${eventType}`);
      return new Response(
        JSON.stringify({ message: `Event ${eventType} ignored` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Idempotency: persisted BEFORE any processing. A replay that already
    // reached 'processed' short-circuits here — no reprocessing, no re-grant,
    // no welcome resend.
    if (!payload.order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }
    const eventId = `${payload.order_id}:${eventType}`;
    const { rowId: webhookEventId, alreadyProcessed } = await claimWebhookEvent(
      supabaseAdmin,
      eventId,
      eventType,
      payload,
    );

    if (alreadyProcessed) {
      return new Response(
        JSON.stringify({ success: true, message: "Event already processed", duplicate: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

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
        console.error("kiwify-webhook: failed to create user", error?.message);
        await supabaseAdmin.from("webhook_events").update({ status: "failed" }).eq("id", webhookEventId);
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
        console.error("kiwify-webhook: profile upsert failed", profileError.message);
      }
    }

    // Grant: entitlement + transaction. Any failure here marks the event
    // 'failed' (not 'processed') and returns 500, so Kiwify's retry will
    // pick it back up — it will not re-create the user or resend welcome
    // since findUserIdByEmail will find them next time.
    try {
      const productId = await resolveProductId(supabaseAdmin, payload.Product?.product_id);

      const { error: entitlementError } = await supabaseAdmin
        .from("entitlements")
        .upsert(
          { user_id: userId, product_id: productId, status: "active", source: "kiwify", external_id: payload.order_id },
          { onConflict: "user_id,product_id" },
        );
      if (entitlementError) throw entitlementError;

      const { error: transactionError } = await supabaseAdmin
        .from("transactions")
        .upsert(
          {
            provider: "kiwify",
            external_id: payload.order_id,
            user_id: userId,
            product_id: productId,
            amount: extractAmount(payload),
            currency: "BRL",
            status: "paid",
            type: payload.Subscription ? "subscription" : "purchase",
            description: payload.Product?.product_name,
          },
          { onConflict: "provider,external_id" },
        );
      if (transactionError) throw transactionError;

      await supabaseAdmin
        .from("webhook_events")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("id", webhookEventId);
    } catch (grantError) {
      const message = grantError instanceof Error ? grantError.message : "Unknown error";
      console.error("kiwify-webhook: entitlement grant failed", message);
      await supabaseAdmin.from("webhook_events").update({ status: "failed" }).eq("id", webhookEventId);
      return new Response(
        JSON.stringify({ error: "Failed to grant entitlement" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Welcome email only fires for a brand-new account — a replayed webhook
    // for an existing customer (e.g. subscription_renewed) never resends it.
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
        console.error("kiwify-webhook: welcome email request failed", emailResponse.status);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isNewUser ? "User created and invite sent" : "User already exists, no email sent",
        userId,
        isNewUser,
        source: "kiwify",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("kiwify-webhook: unhandled error", message);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
