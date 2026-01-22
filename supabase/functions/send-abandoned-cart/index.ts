import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface EmailTemplate {
  subject: string;
  html: (name: string, checkoutUrl: string) => string;
}

const CHECKOUT_BASE_URL = "https://pay.kiwify.com.br/oHyxLi0";

const emailTemplates: Record<string, EmailTemplate> = {
  reminder_1h: {
    subject: "Você esqueceu algo... 💫",
    html: (name: string, checkoutUrl: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #FDF8F3; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #8B4513; font-size: 28px; margin-bottom: 20px;">Olá, ${name}!</h1>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            Notei que você começou a se inscrever na <strong>Jornada Única</strong>, mas não finalizou. 
            Acontece com as melhores! 😊
          </p>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            Sua vaga ainda está reservada e seus dados já estão preenchidos. 
            É só clicar no botão abaixo para continuar de onde parou:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4A574, #C49A6C); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Continuar minha inscrição →
            </a>
          </div>
          
          <p style="color: #8D6E63; font-size: 14px; line-height: 1.6;">
            Se tiver qualquer dúvida, é só responder este email que eu mesma respondo. ❤️
          </p>
          
          <p style="color: #5D4037; font-size: 16px; margin-top: 30px;">
            Com carinho,<br>
            <strong>Jordana Cantarelli</strong>
          </p>
        </div>
      </body>
      </html>
    `,
  },
  reminder_24h: {
    subject: "Sua jornada está te esperando 🌟",
    html: (name: string, checkoutUrl: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #FDF8F3; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #8B4513; font-size: 28px; margin-bottom: 20px;">${name}, você merece esse momento!</h1>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            Sabe aquela sensação de que algo está faltando na sua vida? Aquele vazio que parece 
            impossível de preencher?
          </p>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            A <strong>Jornada Única</strong> foi criada exatamente para isso: te ajudar a encontrar 
            propósito, paz e direção através de um caminho de autoconhecimento guiado.
          </p>
          
          <div style="background: #FDF8F3; border-left: 4px solid #D4A574; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #5D4037; font-size: 16px; margin: 0; font-style: italic;">
              "Não deixe para amanhã a transformação que você pode começar hoje."
            </p>
          </div>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            Imagine daqui a 30 dias olhar para trás e pensar: <em>"Ainda bem que comecei!"</em>
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #D4A574, #C49A6C); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Quero começar minha transformação →
            </a>
          </div>
          
          <p style="color: #5D4037; font-size: 16px; margin-top: 30px;">
            Te espero lá dentro,<br>
            <strong>Jordana Cantarelli</strong>
          </p>
        </div>
      </body>
      </html>
    `,
  },
  reminder_72h: {
    subject: "Última chance de começar sua Jornada Única 🔔",
    html: (name: string, checkoutUrl: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Georgia', serif; background-color: #FDF8F3; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: #8B4513; font-size: 28px; margin-bottom: 20px;">${name}, este é meu último convite</h1>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            Sei que a vida é corrida e às vezes deixamos passar oportunidades importantes. 
            Por isso, vim te lembrar uma última vez sobre a <strong>Jornada Única</strong>.
          </p>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            Mais de 1.000 mulheres já transformaram suas vidas com este programa. 
            Você poderia ser a próxima.
          </p>
          
          <div style="background: #FFF5F5; border: 1px solid #E57373; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <p style="color: #C62828; font-size: 16px; margin: 0; font-weight: bold;">
              ⚠️ Este é o último email que vou te enviar sobre isso.
            </p>
            <p style="color: #5D4037; font-size: 14px; margin: 10px 0 0 0;">
              Se não for para você, tudo bem. Mas se algo dentro de você diz que é... não ignore.
            </p>
          </div>
          
          <p style="color: #5D4037; font-size: 16px; line-height: 1.8;">
            <strong>O que você tem a perder?</strong> São apenas R$ 97 para começar uma nova fase 
            da sua vida. E você tem 7 dias de garantia total.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #C62828, #B71C1C); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Garantir minha vaga agora →
            </a>
          </div>
          
          <p style="color: #8D6E63; font-size: 14px; line-height: 1.6;">
            Se precisar de ajuda ou tiver dúvidas, responda este email. Estou aqui por você.
          </p>
          
          <p style="color: #5D4037; font-size: 16px; margin-top: 30px;">
            Com amor e esperança,<br>
            <strong>Jordana Cantarelli</strong>
          </p>
        </div>
      </body>
      </html>
    `,
  },
};

function buildCheckoutUrl(lead: Lead): string {
  const params = new URLSearchParams();
  if (lead.name) params.set("name", lead.name);
  if (lead.email) params.set("email", lead.email);
  if (lead.phone) params.set("phone", lead.phone);
  return `${CHECKOUT_BASE_URL}?${params.toString()}`;
}

function getHoursSinceCreation(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return (now.getTime() - created.getTime()) / (1000 * 60 * 60);
}

function determineEmailType(hoursSinceCreation: number): string | null {
  if (hoursSinceCreation >= 72) return "reminder_72h";
  if (hoursSinceCreation >= 24) return "reminder_24h";
  if (hoursSinceCreation >= 1) return "reminder_1h";
  return null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all leads
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, name, email, phone, created_at")
      .order("created_at", { ascending: true });

    if (leadsError) {
      console.error("Error fetching leads:", leadsError);
      throw leadsError;
    }

    // Get all profiles (converted customers)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    const customerEmails = new Set(profiles?.map((p) => p.email?.toLowerCase()) || []);

    // Get already sent emails
    const { data: sentEmails, error: sentError } = await supabase
      .from("abandoned_cart_emails")
      .select("lead_id, email_type");

    if (sentError) {
      console.error("Error fetching sent emails:", sentError);
      throw sentError;
    }

    const sentEmailsMap = new Map<string, Set<string>>();
    sentEmails?.forEach((se) => {
      if (!sentEmailsMap.has(se.lead_id)) {
        sentEmailsMap.set(se.lead_id, new Set());
      }
      sentEmailsMap.get(se.lead_id)!.add(se.email_type);
    });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const lead of leads || []) {
      // Skip if lead already converted to customer
      if (customerEmails.has(lead.email?.toLowerCase())) {
        console.log(`Skipping ${lead.email} - already a customer`);
        continue;
      }

      const hoursSinceCreation = getHoursSinceCreation(lead.created_at);
      const emailType = determineEmailType(hoursSinceCreation);

      if (!emailType) {
        console.log(`Skipping ${lead.email} - too recent (${hoursSinceCreation.toFixed(1)}h)`);
        continue;
      }

      // Check if this specific email type was already sent
      const leadSentEmails = sentEmailsMap.get(lead.id) || new Set();
      if (leadSentEmails.has(emailType)) {
        console.log(`Skipping ${lead.email} - ${emailType} already sent`);
        continue;
      }

      // Check if we should send this email based on timing
      // For 24h email, only send if 1h email was already sent (or if >24h passed)
      // For 72h email, only send if 24h email was already sent (or if >72h passed)
      if (emailType === "reminder_24h" && !leadSentEmails.has("reminder_1h") && hoursSinceCreation < 24) {
        continue;
      }
      if (emailType === "reminder_72h" && !leadSentEmails.has("reminder_24h") && hoursSinceCreation < 72) {
        continue;
      }

      const template = emailTemplates[emailType];
      const checkoutUrl = buildCheckoutUrl(lead);
      const firstName = lead.name?.split(" ")[0] || "Amiga";

      try {
        console.log(`Sending ${emailType} to ${lead.email}`);
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Jordana Cantarelli <contato@traide.lovable.app>",
            to: [lead.email],
            subject: template.subject,
            html: template.html(firstName, checkoutUrl),
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.text();
          throw new Error(`Resend API error: ${errorData}`);
        }

        console.log("Email sent successfully");

        // Log the sent email
        const { error: logError } = await supabase
          .from("abandoned_cart_emails")
          .insert({
            lead_id: lead.id,
            email_type: emailType,
          });

        if (logError) {
          console.error("Error logging email:", logError);
          errors.push(`Failed to log email for ${lead.email}: ${logError.message}`);
        } else {
          emailsSent++;
        }
      } catch (emailError: any) {
        console.error(`Error sending email to ${lead.email}:`, emailError);
        errors.push(`Failed to send to ${lead.email}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-abandoned-cart:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
