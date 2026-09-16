import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { claimPendingEmails, markEmailFailed, markEmailSent } from "../_shared/outbox.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const INTERNAL_FUNCTION_SECRET = Deno.env.get("INTERNAL_FUNCTION_SECRET");

const OUTBOX_KIND = "welcome";
const DRAIN_LIMIT = 20;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

interface WelcomePayload {
  name: string;
  // Preferred: a one-time Supabase action_link (invite/recovery) — never a password.
  actionLink?: string;
  // Legacy path: admin-created users where an admin explicitly chose a password
  // (create-admin-user, Track B). Kept for backward compatibility only.
  password?: string;
  loginUrl?: string;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function buildWelcomeEmail(email: string, payload: WelcomePayload): { subject: string; html: string } {
  const { name, actionLink, password, loginUrl } = payload;
  const firstName = name ? name.split(" ")[0] : "querida";
  const accessUrl = actionLink || loginUrl || "https://www.jordanacantarelli.com.br/membros";
  const ctaLabel = actionLink ? "CRIAR MINHA SENHA E ACESSAR" : "ACESSAR MINHA JORNADA";

  const credentialsBoxHtml = actionLink
    ? `
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #253244;">
                      🔐 Seu acesso:
                    </h3>
                    <p style="margin: 0 0 8px; font-size: 15px; color: #253244;">
                      <strong>E-mail:</strong> ${email}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #682A0C; font-weight: 500;">
                      ⚠️ Clique no botão abaixo para criar sua senha. Este link é pessoal e expira em breve.
                    </p>`
    : `
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #253244;">
                      🔐 Seus dados de acesso:
                    </h3>
                    <p style="margin: 0 0 8px; font-size: 15px; color: #253244;">
                      <strong>E-mail:</strong> ${email}
                    </p>
                    <p style="margin: 0 0 16px; font-size: 15px; color: #253244;">
                      <strong>Senha:</strong> ${password}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #682A0C; font-weight: 500;">
                      ⚠️ Recomendamos que você troque sua senha no primeiro acesso por uma senha de sua preferência.
                    </p>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vinda à Jornada Única</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F0E2D2;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #253244 0%, #3a4a5c 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #FFFFFF;">
                Jornada Única
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                por Jordana Cantarelli
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #253244;">
                Olá, ${firstName}! 🌸
              </h2>

              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #253244;">
                Seu acesso à <strong>Jornada Única</strong> está liberado!
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #253244;">
                Uma experiência guiada para mulheres que querem viver sua fé sem sobrecarga emocional — com mais serenidade, entendimento e leveza no dia a dia.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F0E2D2; border-radius: 12px; border: 2px solid #D49E9E; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    ${credentialsBoxHtml}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${accessUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D49E9E 0%, #e8b8b8 50%, #D49E9E 100%); color: #253244; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Instructions Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F0E2D2; border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #253244;">
                      📚 Como começar:
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #253244;">
                      <li>Clique no botão acima para acessar</li>
                      <li>${actionLink ? "Crie sua senha" : "Faça login com o e-mail e senha acima"}</li>
                      <li>Explore os módulos e comece sua jornada</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #6B6561;">
                Qualquer dúvida, é só responder este email ou entrar em contato pelo <a href="mailto:info@jordanacantarelli.com.br" style="color: #682A0C;">info@jordanacantarelli.com.br</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #F0E2D2; border-radius: 0 0 16px 16px; border-top: 1px solid #D49E9E;">
              <p style="margin: 0; font-size: 12px; color: #6B6561;">
                © ${new Date().getFullYear()} Jordana Cantarelli. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

  return { subject: "🌸 Bem-vinda à Jornada Única! Seu acesso está liberado", html };
}

async function sendViaResend(email: string, payload: WelcomePayload): Promise<void> {
  const { subject, html } = buildWelcomeEmail(email, payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Jordana Cantarelli <noreply@jordanacantarelli.com.br>", to: [email], subject, html }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(`Resend API error ${response.status}: ${data?.message ?? "unknown"}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Fail-closed: this function is only meant to be called server-to-server
  // by other edge functions, never directly from the public internet.
  const providedSecret = req.headers.get("x-internal-secret");
  if (!INTERNAL_FUNCTION_SECRET || !providedSecret || !timingSafeEqual(providedSecret, INTERNAL_FUNCTION_SECRET)) {
    console.error("send-welcome-email: rejected, missing or invalid x-internal-secret");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }

  try {
    // Legacy direct-send path: a caller (e.g. Track B's create-admin-user)
    // still passing a full payload with `email` gets an immediate, synchronous
    // send — unchanged behavior, no outbox involved.
    const body = await req.json().catch(() => ({}));
    if (body?.email) {
      const { email, ...payload } = body as { email: string } & WelcomePayload;
      if (!payload.actionLink && !payload.password) {
        return new Response(
          JSON.stringify({ error: "actionLink or password is required" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
        );
      }
      await sendViaResend(email, payload);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Outbox drain mode: no specific email in the body — process whatever's
    // pending. This is how kiwify-webhook triggers delivery, and how a
    // future cron sweep (owner's territory) would call this too.
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const rows = await claimPendingEmails(supabaseAdmin, OUTBOX_KIND, DRAIN_LIMIT);
    let sent = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        await sendViaResend(row.recipient_email, row.payload as unknown as WelcomePayload);
        await markEmailSent(supabaseAdmin, row.id);
        sent++;
      } catch (sendError) {
        const message = sendError instanceof Error ? sendError.message : "unknown error";
        console.error("send-welcome-email: outbox row failed", row.id, message);
        await markEmailFailed(supabaseAdmin, row.id, row.attempts, message);
        failed++;
      }
    }

    return new Response(JSON.stringify({ success: true, processed: rows.length, sent, failed }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-welcome-email: unhandled error", message);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
