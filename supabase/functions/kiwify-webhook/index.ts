import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { verifyHmacSha256 } from "../_shared/crypto.ts";
import { ensureUser } from "../_shared/users.ts";
import { resolveProductId } from "../_shared/products.ts";
import { grantEntitlementAndTransaction } from "../_shared/entitlements.ts";
import { enqueueEmail } from "../_shared/outbox.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KIWIFY_WEBHOOK_TOKEN = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");

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

function extractAmount(payload: KiwifyWebhookPayload): number {
  const raw = payload.Commissions?.charge_amount ?? payload.charge_amount ?? payload.amount ?? payload.Product?.price;
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

// Best-effort: wakes the consumer up for near-real-time delivery. The
// outbox row already persisted is the actual durability guarantee — if this
// call fails or times out, the row stays 'pending' for the next drain.
function triggerWelcomeDrain(): void {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  };
  if (INTERNAL_FUNCTION_SECRET) headers["x-internal-secret"] = INTERNAL_FUNCTION_SECRET;

  fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, { method: "POST", headers }).catch((err) => {
    console.error("kiwify-webhook: welcome drain trigger failed", err instanceof Error ? err.message : err);
  });
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

    if (!payload.order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Idempotency: persisted BEFORE any processing. A replay that already
    // reached 'processed' short-circuits here — no reprocessing, no re-grant,
    // no welcome resend.
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

    // kiwify-webhook only orchestrates from here — identity, welcome enqueue
    // and the grant each live in _shared.
    const { userId, isNewUser, actionLink } = await ensureUser(
      supabaseAdmin,
      customerEmail,
      customerName,
      "https://www.jordanacantarelli.com.br/membros/reset-password",
    );

    // Enqueued BEFORE the grant attempt below: a later 500 from the grant
    // step can no longer lose the welcome email — the row is already durable.
    if (isNewUser && actionLink) {
      try {
        await enqueueEmail(supabaseAdmin, {
          kind: "welcome",
          recipientEmail: customerEmail,
          payload: {
            name: customerName || customerEmail.split("@")[0],
            actionLink,
            loginUrl: "https://www.jordanacantarelli.com.br/membros",
          },
        });
        triggerWelcomeDrain();
      } catch (outboxError) {
        // email_outbox may not be migrated yet — never fail the webhook (the
        // user + entitlement grant below are the critical path) for this.
        const message = outboxError instanceof Error ? outboxError.message : "unknown error";
        console.error("kiwify-webhook: welcome enqueue failed", message);
      }
    }

    try {
      const productId = await resolveProductId(supabaseAdmin, payload.Product?.product_id);

      await grantEntitlementAndTransaction(supabaseAdmin, {
        userId,
        productId,
        source: "kiwify",
        externalId: payload.order_id,
        amount: extractAmount(payload),
        currency: "BRL",
        type: payload.Subscription ? "subscription" : "purchase",
        description: payload.Product?.product_name,
      });

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

    return new Response(
      JSON.stringify({
        success: true,
        message: isNewUser ? "User created, entitlement granted, invite enqueued" : "Entitlement granted",
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
