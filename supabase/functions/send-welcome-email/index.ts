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

    const firstName = name ? name.split(" ")[0] : "querida";
    const accessUrl = loginUrl || "https://www.jordanacantarelli.com.br/membros";

    const emailHtml = `
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
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${accessUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D49E9E 0%, #e8b8b8 50%, #D49E9E 100%); color: #253244; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ACESSAR MINHA JORNADA
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
                      <li>Faça login com o e-mail e senha acima</li>
                      <li>Troque sua senha por uma de sua preferência</li>
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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Jordana Cantarelli <noreply@jordanacantarelli.com.br>",
        to: [email],
        subject: "🌸 Bem-vinda à Jornada Única! Seus dados de acesso",
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