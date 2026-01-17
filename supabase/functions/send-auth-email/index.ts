import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailPayload {
  user: {
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: "signup" | "recovery" | "magiclink" | "email_change" | "invite";
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

const getEmailContent = (type: string, email: string, name: string, actionUrl: string) => {
  const firstName = name ? name.split(" ")[0] : "querida";
  
  const templates: Record<string, { subject: string; title: string; message: string; buttonText: string; warning: string }> = {
    recovery: {
      subject: "🔐 Redefinição de Senha - Jornada Única",
      title: "Redefinição de Senha",
      message: `Olá, ${firstName}! Você solicitou a redefinição da sua senha. Clique no botão abaixo para criar uma nova senha segura.`,
      buttonText: "REDEFINIR MINHA SENHA",
      warning: "⚠️ Este link expira em 1 hora. Se você não solicitou esta alteração, ignore este email."
    },
    signup: {
      subject: "✨ Confirme seu cadastro - Jornada Única",
      title: "Confirme seu E-mail",
      message: `Olá, ${firstName}! Estamos quase lá! Clique no botão abaixo para confirmar seu cadastro e ter acesso à Jornada Única.`,
      buttonText: "CONFIRMAR MEU CADASTRO",
      warning: "⚠️ Este link expira em 24 horas."
    },
    magiclink: {
      subject: "🔑 Seu link de acesso - Jornada Única",
      title: "Link de Acesso",
      message: `Olá, ${firstName}! Você solicitou um link mágico para acessar sua conta. Clique no botão abaixo para entrar.`,
      buttonText: "ACESSAR MINHA CONTA",
      warning: "⚠️ Este link expira em 1 hora e só pode ser usado uma vez."
    },
    email_change: {
      subject: "📧 Confirme seu novo e-mail - Jornada Única",
      title: "Confirme a Alteração de E-mail",
      message: `Olá, ${firstName}! Você solicitou a alteração do seu e-mail. Clique no botão abaixo para confirmar o novo endereço.`,
      buttonText: "CONFIRMAR NOVO E-MAIL",
      warning: "⚠️ Este link expira em 24 horas. Se você não solicitou esta alteração, ignore este email."
    },
    invite: {
      subject: "🌸 Você foi convidada! - Jornada Única",
      title: "Convite para a Jornada Única",
      message: `Olá! Você foi convidada para fazer parte da Jornada Única. Clique no botão abaixo para criar sua conta.`,
      buttonText: "ACEITAR CONVITE",
      warning: "⚠️ Este link expira em 7 dias."
    }
  };

  const template = templates[type] || templates.recovery;
  
  return {
    subject: template.subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.title}</title>
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
                ${template.title}
              </h2>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #253244;">
                ${template.message}
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${actionUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D49E9E 0%, #e8b8b8 50%, #D49E9E 100%); color: #253244; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${template.buttonText}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F0E2D2; border-radius: 12px; border: 2px solid #D49E9E;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="margin: 0; font-size: 14px; color: #253244; line-height: 1.5;">
                      ${template.warning}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: #6B6561;">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #682A0C; word-break: break-all;">
                ${actionUrl}
              </p>
              
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #6B6561;">
                Qualquer dúvida, é só entrar em contato pelo <a href="mailto:info@jordanacantarelli.com.br" style="color: #682A0C;">info@jordanacantarelli.com.br</a>
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
    `
  };
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-auth-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: AuthEmailPayload = await req.json();
    
    console.log("Auth email payload received:", JSON.stringify({
      email: payload.user?.email,
      type: payload.email_data?.email_action_type,
      redirect_to: payload.email_data?.redirect_to
    }));

    const { user, email_data } = payload;
    
    if (!user?.email || !email_data) {
      console.error("Invalid payload: missing user email or email_data");
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const email = user.email;
    const name = user.user_metadata?.name || "";
    const type = email_data.email_action_type;
    
    // Build the action URL with the token
    let actionUrl = email_data.redirect_to || email_data.site_url;
    
    // Append token_hash to the URL for verification
    if (email_data.token_hash) {
      const separator = actionUrl.includes("?") ? "&" : "?";
      actionUrl = `${actionUrl}${separator}token_hash=${email_data.token_hash}&type=${type}`;
    }

    console.log(`Preparing ${type} email for: ${email}`);
    
    const { subject, html } = getEmailContent(type, email, name, actionUrl);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Jordana Cantarelli <noreply@jordanacantarelli.com.br>",
        to: [email],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Failed to send email" }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Auth email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);