import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  password: string;
  loginUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, password, loginUrl }: WelcomeEmailRequest = await req.json();
    
    console.log(`Sending welcome email to: ${email}, name: ${name}`);

    if (!email) {
      console.error("Email is required");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const firstName = name ? name.split(" ")[0] : "aluna";
    const accessUrl = loginUrl || "https://app.samiragouvea.com.br/";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vinda ao Carrosséis Magnéticos</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F6EFEA;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #B21F2D 0%, #7E121D 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #FFFFFF;">
                Carrosséis Magnéticos
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                por Samira Gouvêa
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #1C1B1A;">
                Olá, ${firstName}! 🎉
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #4B2E2A;">
                Seu acesso ao <strong>Caderno Digital Carrosséis Magnéticos</strong> está liberado!
              </p>
              
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #4B2E2A;">
                Agora você tem em mãos tudo que precisa para criar carrosséis que conectam, engajam e vendem no Instagram.
              </p>
              
              <!-- Credentials Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #FEF9E7; border-radius: 12px; border: 2px solid #C4A052; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1C1B1A;">
                      🔐 Seus dados de acesso:
                    </h3>
                    <p style="margin: 0 0 8px; font-size: 15px; color: #4B2E2A;">
                      <strong>E-mail:</strong> ${email}
                    </p>
                    <p style="margin: 0 0 16px; font-size: 15px; color: #4B2E2A;">
                      <strong>Senha:</strong> ${password}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #B21F2D; font-weight: 500;">
                      ⚠️ Recomendamos que você troque sua senha no primeiro acesso por uma senha de sua preferência.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${accessUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #C4A052 0%, #E8D6B0 50%, #C4A052 100%); color: #1C1B1A; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ACESSAR MEU CADERNO
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Instructions Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F6EFEA; border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #1C1B1A;">
                      📚 Como começar:
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #4B2E2A;">
                      <li>Clique no botão acima para acessar</li>
                      <li>Faça login com o e-mail e senha acima</li>
                      <li>Troque sua senha por uma de sua preferência</li>
                      <li>Explore os módulos e comece pelo que fizer mais sentido pra você</li>
                    </ol>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #6B6561;">
                Qualquer dúvida, é só responder este email ou entrar em contato pelo <a href="mailto:contato@samiragouvea.com.br" style="color: #B21F2D;">contato@samiragouvea.com.br</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; background-color: #F6EFEA; border-radius: 0 0 16px 16px; border-top: 1px solid #E8D6C8;">
              <p style="margin: 0; font-size: 12px; color: #6B6561;">
                © ${new Date().getFullYear()} Samira Gouvêa. Todos os direitos reservados.
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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Samira Gouvêa <noreply@samiragouvea.com.br>",
        to: [email],
        subject: "🎉 Bem-vinda ao Carrosséis Magnéticos! Seus dados de acesso",
        html: emailHtml,
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

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
