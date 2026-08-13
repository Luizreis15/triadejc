import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hubla-signature",
};

const DEFAULT_PASSWORD = "Mudar@123";

// Hubla webhook payload structure (based on actual webhook data)
interface HublaWebhookPayload {
  type: string;
  version: string;
  event: {
    product?: {
      id: string;
      name: string;
    };
    subscription?: {
      id: string;
      status: string;
      payer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
    };
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("hubla-webhook function called");
  console.log("Request method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    console.error("Invalid method:", req.method);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const payload: HublaWebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    const eventType = payload.type;

    // Extract customer data from the correct location in Hubla's payload
    // Priority: payer (who paid) > user (member added)
    const payer = payload.event?.subscription?.payer;
    const user = payload.event?.user;
    
    const customerEmail = payer?.email || user?.email;
    const customerFirstName = payer?.firstName || user?.firstName || "";
    const customerLastName = payer?.lastName || user?.lastName || "";
    const customerName = `${customerFirstName} ${customerLastName}`.trim();

    if (!customerEmail) {
      console.error("Customer email is required. Payload structure:", JSON.stringify(payload, null, 2));
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process relevant Hubla events
    const validEvents = [
      "customer.member_added",
      "purchase.approved", 
      "purchase.confirmed", 
      "subscription.activated", 
      "sale.approved"
    ];
    
    if (!validEvents.includes(eventType)) {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(
        JSON.stringify({ message: `Event ${eventType} ignored` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${eventType} for ${customerEmail} (${customerName})`);

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === customerEmail);

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      console.log(`User already exists: ${customerEmail}`);
      userId = existingUser.id;
    } else {
      // Create new user with default password
      console.log(`Creating new user: ${customerEmail}`);
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          name: customerName,
        },
      });

      if (authError) {
        console.error("Error creating user:", authError);
        return new Response(
          JSON.stringify({ error: `Failed to create user: ${authError.message}` }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      userId = authUser.user.id;
      isNewUser = true;
      console.log(`User created successfully: ${userId}`);

      // Update profile with name from Hubla
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          email: customerEmail,
          name: customerName,
        }, { onConflict: "id" });

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    // Send welcome email with credentials
    console.log("Sending welcome email...");
    const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        name: customerName || customerEmail.split("@")[0],
        email: customerEmail,
        password: DEFAULT_PASSWORD,
        loginUrl: "https://www.jordanacantarelli.com.br/membros",
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("Error sending welcome email:", emailError);
    } else {
      console.log("Welcome email sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: isNewUser ? "User created and email sent" : "User already exists, email sent",
        userId,
        email: customerEmail,
        name: customerName
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in hubla-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
