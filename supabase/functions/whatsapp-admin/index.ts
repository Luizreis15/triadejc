import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { instanceConnected, sendText } from "../_shared/uazapi.ts";
import { maskPhone, normalizeBrazilPhone } from "../_shared/phone.ts";
import { renderWelcomeMessage, templateIsUsable } from "../_shared/whatsappMessage.ts";
import { shortAccessLink } from "../_shared/accessLink.ts";
import { findContactPhone } from "../_shared/contactPhone.ts";
import { senderPhones } from "../_shared/senderPhone.ts";

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
    if ((await senderPhones(admin)).has(phone)) {
      return json(cors, 400, { error: "Este é o WhatsApp da SDR, que só dispara. Use outro número para o teste." });
    }
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

  if (action === "contact_phone") {
    const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
    if (!userId) return json(cors, 400, { error: "Informe a aluna" });
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).maybeSingle();
    const email = typeof profile?.email === "string" ? profile.email : "";
    const phone = email ? await findContactPhone(admin, email) : null;
    return json(cors, 200, { phone });
  }

  if (action === "resend_access") {
    const userId = typeof body.user_id === "string" ? body.user_id.trim() : "";
    if (!userId) return json(cors, 400, { error: "Informe a aluna" });
    const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
    const typedPhone = rawPhone ? normalizeBrazilPhone(rawPhone) : null;
    if (rawPhone && !typedPhone) return json(cors, 400, { error: "Informe o celular com DDD" });
    if (typedPhone && (await senderPhones(admin)).has(typedPhone)) {
      return json(cors, 400, { error: "Este é o WhatsApp da SDR, que só dispara. Informe o celular da aluna." });
    }

    const { data: profile } = await admin.from("profiles").select("email, name").eq("id", userId).maybeSingle();
    const email = typeof profile?.email === "string" ? profile.email.trim() : "";
    if (!email) return json(cors, 404, { error: "Aluna sem e-mail cadastrado" });
    const name = (typeof profile?.name === "string" && profile.name.trim()) || email.split("@")[0];

    // Um link só, usado no e-mail e no WhatsApp: gerar dois invalidaria o primeiro.
    const { data: recovery, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: "https://www.jordanacantarelli.com.br/membros/reset-password" },
    });
    const actionLink = recovery?.properties?.action_link;
    if (linkError || !actionLink) {
      console.error("whatsapp-admin: recovery link failed", linkError?.message ?? "no link");
      return json(cors, 502, { error: "Não foi possível gerar o link de acesso" });
    }

    // O link novo invalida o antigo: mensagem parada na fila não pode sair com ele.
    await admin.from("whatsapp_outbox").update({
      status: "skipped",
      last_error: "Substituída por reenvio de acesso",
    }).eq("status", "queued").eq("payload->>email", email);

    let emailSent = false;
    const internalSecret = Deno.env.get("INTERNAL_FUNCTION_SECRET") ?? "";
    if (internalSecret) {
      try {
        const response = await fetch(`${Deno.env.get("SUPABASE_URL")!}/functions/v1/send-welcome-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
            "x-internal-secret": internalSecret,
          },
          body: JSON.stringify({ name, email, actionLink, loginUrl: "https://www.jordanacantarelli.com.br/membros" }),
        });
        emailSent = response.ok;
        await response.text().catch(() => "");
        if (!response.ok) console.error("whatsapp-admin: resend email rejected", response.status);
      } catch (error) {
        console.error("whatsapp-admin: resend email failed", error instanceof Error ? error.message : "unknown");
      }
    } else {
      console.error("whatsapp-admin: resend email skipped, internal secret missing");
    }

    const phone = typedPhone ?? await findContactPhone(admin, email);

    let whatsapp: "sent" | "queued" | "no_phone" | "off" = "no_phone";
    if (phone) {
      const { data: connection } = await admin
        .from("whatsapp_connection")
        .select("enabled, base_url, token")
        .eq("id", 1)
        .maybeSingle();
      const { data: template } = await admin.from("whatsapp_templates").select("body").eq("key", "welcome").maybeSingle();
      if (!connection?.enabled || !connection.base_url || !connection.token || !template?.body) {
        whatsapp = "off";
      } else {
        const row = {
          kind: "welcome",
          to_phone: phone,
          payload: { name, email, actionLink },
          idempotency_key: `resend:${userId}:${crypto.randomUUID()}`,
        };
        try {
          const shortLink = await shortAccessLink(admin, actionLink);
          const text = renderWelcomeMessage(template.body, { name, email, link: shortLink });
          const providerId = await sendText(connection.base_url, connection.token, phone, text);
          await admin.from("whatsapp_outbox").insert({
            ...row,
            status: "sent",
            attempts: 1,
            sent_at: new Date().toISOString(),
            provider_id: providerId,
          });
          whatsapp = "sent";
        } catch (error) {
          console.error("whatsapp-admin: resend whatsapp failed", error instanceof Error ? error.message : "unknown");
          // Fica na fila: a rotina de envio tenta de novo.
          const { error: queueError } = await admin.from("whatsapp_outbox").insert({ ...row, status: "queued" });
          whatsapp = queueError ? "off" : "queued";
        }
      }
    }

    if (!emailSent && whatsapp !== "sent" && whatsapp !== "queued") {
      return json(cors, 502, { error: "O acesso não saiu nem por e-mail nem por WhatsApp" });
    }
    return json(cors, 200, { ok: true, email: emailSent, whatsapp, phone: phone ? maskPhone(phone) : null });
  }

  return json(cors, 400, { error: "Ação inválida" });
});
