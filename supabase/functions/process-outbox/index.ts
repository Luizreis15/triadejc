import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Cron / manual sweeper for durable email delivery.
// kiwify-webhook enqueues + best-effort drains; this function is the
// reliability backstop when that fire-and-forget call fails (401, timeout,
// cold start). Scheduled via Supabase Dashboard → Edge Functions → Schedules
// (or pg_cron) with header x-internal-secret.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function invokeInternal(path: string): Promise<{ ok: boolean; status: number; body: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "x-internal-secret": INTERNAL_FUNCTION_SECRET!,
  };
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
    method: "POST",
    headers,
    body: "{}",
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!INTERNAL_FUNCTION_SECRET) {
    console.error("process-outbox: INTERNAL_FUNCTION_SECRET is not configured");
    return new Response(
      JSON.stringify({ error: "Misconfigured" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  const providedSecret = req.headers.get("x-internal-secret");
  if (!providedSecret || !timingSafeEqual(providedSecret, INTERNAL_FUNCTION_SECRET)) {
    console.error("process-outbox: rejected, missing or invalid x-internal-secret");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    const welcome = await invokeInternal("send-welcome-email");
    if (!welcome.ok) {
      console.error("process-outbox: welcome drain failed", welcome.status, welcome.body);
    }

    const abandoned = await invokeInternal("send-abandoned-cart");
    if (!abandoned.ok) {
      console.error("process-outbox: abandoned-cart drain failed", abandoned.status, abandoned.body);
    }

    return new Response(
      JSON.stringify({
        success: welcome.ok && abandoned.ok,
        welcome,
        abandoned,
      }),
      {
        status: welcome.ok && abandoned.ok ? 200 : 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("process-outbox: unhandled error", message);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
