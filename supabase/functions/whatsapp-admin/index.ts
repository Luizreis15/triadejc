import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { instanceConnected, sendText } from "../_shared/uazapi.ts";
import { maskPhone, normalizeBrazilPhone } from "../_shared/phone.ts";
import { renderWelcomeMessage, templateIsUsable } from "../_shared/whatsappMessage.ts";

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

function json(cors: Record<string, string>, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("https://")) return null;
  return trimmed;
}

async function requireAdmin(admin: SupabaseClient, req: Request) {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return null;
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  const { data: role } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return role ? user : null;
}

Deno.serve(async (req) => {
  const cors = corsHeadersFor(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(cors, 405, { error: "Método inválido" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const user = await requireAdmin(admin, req);
  if (!user) return json(cors, 401, { error: "Apenas admins" });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "get") {
    const { data: connection } = await admin
      .from("whatsapp_connection")
      .select("enabled, base_url, instance_name, phone_e164, token, last_status, last_checked_at")
      .eq("id", 1)
      .maybeSingle();
    const { data: template } = await admin.from("whatsapp_templates").select("body").eq("key", "welcome").maybeSingle();
    const { data: messages } = await admin
      .from("whatsapp_outbox")
      .select("id, to_phone, status, attempts, last_error, created_at, sent_at, payload")
      .order("created_at", { ascending: false })
      .limit(30);

    return json(cors, 200, {
      connection: {
        enabled: Boolean(connection?.enabled),
        base_url: connection?.base_url ?? "",
        instance_name: connection?.instance_name ?? "",
        phone_e164: connection?.phone_e164 ?? "",
        token_configured: Boolean(connection?.token),
        last_status: connection?.last_status ?? null,
        last_checked_at: connection?.last_checked_at ?? null,
      },
      template: template?.body ?? "",
      messages: (messages ?? []).map((row) => {
        const payload = row.payload && typeof row.payload === "object" ? row.payload as Record<string, unknown> : {};
        const name = typeof payload.name === "string" ? payload.name : "";
        return {
          id: row.id,
          phone: maskPhone(String(row.to_phone ?? "")),
          name,
          status: row.status,
          attempts: row.attempts,
          last_error: row.last_error,
          created_at: row.created_at,
          sent_at: row.sent_at,
        };
      }),
    });
  }

  if (action === "save_connection") {
    const baseUrl = cleanUrl(body.base_url);
    const instanceName = typeof body.instance_name === "string" ? body.instance_name.trim() : "";
    const rawPhone = typeof body.phone_e164 === "string" ? body.phone_e164.trim() : "";
    const phone = rawPhone ? normalizeBrazilPhone(rawPhone) : null;
    const enabled = body.enabled === true;
    const token = typeof body.token === "string" ? body.token.trim() : "";
    if (!baseUrl || !instanceName) return json(cors, 400, { error: "Informe a URL https e o nome da instância" });
    if (rawPhone && !phone) return json(cors, 400, { error: "Informe o celular com DDD" });

    const { data: current } = await admin.from("whatsapp_connection").select("token").eq("id", 1).maybeSingle();
    const nextToken = token || current?.token || null;
    if (enabled && !nextToken) return json(cors, 400, { error: "Cole o token antes de ligar o disparo" });

    const { error } = await admin.from("whatsapp_connection").update({
      enabled,
      base_url: baseUrl,
      instance_name: instanceName,
      phone_e164: phone,
      token: nextToken,
      updated_at: new Date().toISOString(),
    }).eq("id", 1);
    if (error) return json(cors, 500, { error: "Não foi possível salvar a conexão" });
    return json(cors, 200, { ok: true });
  }

  if (action === "status") {
    const { data: connection } = await admin
      .from("whatsapp_connection")
      .select("base_url, token")
      .eq("id", 1)
      .maybeSingle();
    if (!connection?.base_url || !connection.token) {
      return json(cors, 200, { connected: false, reason: "Sem token" });
    }
    const connected = await instanceConnected(connection.base_url, connection.token);
    await admin.from("whatsapp_connection").update({
      last_status: connected ? "connected" : "disconnected",
      last_checked_at: new Date().toISOString(),
    }).eq("id", 1);
    return json(cors, 200, { connected });
  }

  if (action === "save_template") {
    const template = typeof body.body === "string" ? body.body : "";
    if (!templateIsUsable(template)) {
      return json(cors, 400, { error: "O texto precisa ter {email} e {link}, com até 1200 caracteres" });
    }
    const { error } = await admin.from("whatsapp_templates").update({
      body: template,
      updated_at: new Date().toISOString(),
    }).eq("key", "welcome");
    if (error) return json(cors, 500, { error: "Não foi possível salvar a mensagem" });
    return json(cors, 200, { ok: true });
  }

  if (action === "send_test") {
    const phone = normalizeBrazilPhone(typeof body.phone === "string" ? body.phone : "");
    if (!phone) return json(cors, 400, { error: "Informe um celular com DDD" });
    const { data: connection } = await admin
      .from("whatsapp_connection")
      .select("base_url, token")
      .eq("id", 1)
      .maybeSingle();
    const { data: template } = await admin.from("whatsapp_templates").select("body").eq("key", "welcome").maybeSingle();
    if (!connection?.base_url || !connection.token || !template?.body) {
      return json(cors, 400, { error: "Salve a conexão e a mensagem antes do teste" });
    }
    const link = "https://www.jordanacantarelli.com.br/membros";
    const text = renderWelcomeMessage(template.body, {
      name: "Teste",
      email: user.email ?? "acesso@jordanacantarelli.com.br",
      link,
    });
    try {
      const providerId = await sendText(connection.base_url, connection.token, phone, text);
      await admin.from("whatsapp_outbox").insert({
        kind: "welcome",
        to_phone: phone,
        payload: { name: "Teste" },
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_id: providerId,
        idempotency_key: `test:${crypto.randomUUID()}`,
      });
    } catch {
      return json(cors, 502, { error: "O Uazapi não aceitou o teste" });
    }
    return json(cors, 200, { ok: true });
  }

  return json(cors, 400, { error: "Ação inválida" });
});
