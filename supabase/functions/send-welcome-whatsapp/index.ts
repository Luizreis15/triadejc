import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { instanceConnected, sendText } from "../_shared/uazapi.ts";
import { renderWelcomeMessage } from "../_shared/whatsappMessage.ts";

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

interface OutboxRow {
  id: string;
  to_phone: string;
  payload: Record<string, unknown>;
  attempts: number;
}

function asPayload(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

async function deliver(admin: SupabaseClient, row: OutboxRow): Promise<"sent" | "skipped" | "retry"> {
  const { data: connection } = await admin
    .from("whatsapp_connection")
    .select("enabled, base_url, token")
    .eq("id", 1)
    .maybeSingle();

  if (!connection?.enabled || !connection.base_url || !connection.token) {
    await admin.from("whatsapp_outbox").update({
      status: "skipped",
      last_error: "Conexão desligada ou incompleta",
    }).eq("id", row.id);
    return "skipped";
  }

  const { data: template } = await admin
    .from("whatsapp_templates")
    .select("body")
    .eq("key", "welcome")
    .maybeSingle();

  const payload = row.payload;
  const name = typeof payload.name === "string" ? payload.name : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const link = typeof payload.actionLink === "string" ? payload.actionLink : "";
  if (!template?.body || !email || !link) {
    await admin.from("whatsapp_outbox").update({
      status: "failed",
      last_error: "Mensagem sem texto, e-mail ou link",
    }).eq("id", row.id);
    return "skipped";
  }

  try {
    const text = renderWelcomeMessage(template.body, { name, email, link });
    const providerId = await sendText(connection.base_url, connection.token, row.to_phone, text);
    await admin.from("whatsapp_outbox").update({
      status: "sent",
      provider_id: providerId,
      sent_at: new Date().toISOString(),
      last_error: null,
    }).eq("id", row.id);
    return "sent";
  } catch (error) {
    const giveUp = row.attempts >= 3;
    await admin.from("whatsapp_outbox").update({
      status: giveUp ? "failed" : "queued",
      next_attempt_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      last_error: giveUp ? "Falha ao enviar" : "Nova tentativa em instantes",
    }).eq("id", row.id);
    console.error("send-welcome-whatsapp: send failed", error instanceof Error ? error.message : "unknown");
    return "retry";
  }
}

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const providedSecret = req.headers.get("x-internal-secret");
  if (!INTERNAL_FUNCTION_SECRET || !providedSecret || !timingSafeEqual(providedSecret, INTERNAL_FUNCTION_SECRET)) {
    console.error("send-welcome-whatsapp: rejected, missing or invalid x-internal-secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.rpc("claim_whatsapp_outbox", { _limit: 20 });
  if (error) {
    console.error("send-welcome-whatsapp: claim failed", error.message);
    return new Response(JSON.stringify({ error: "claim failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  let sent = 0;
  let skipped = 0;
  let retry = 0;
  for (const raw of (data ?? []) as Array<Record<string, unknown>>) {
    const result = await deliver(admin, {
      id: String(raw.id),
      to_phone: String(raw.to_phone),
      payload: asPayload(raw.payload),
      attempts: Number(raw.attempts ?? 1),
    });
    if (result === "sent") sent += 1;
    else if (result === "retry") retry += 1;
    else skipped += 1;
  }

  return new Response(JSON.stringify({ success: true, claimed: (data ?? []).length, sent, skipped, retry }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

if (import.meta.main) {
  serve(handler);
}
