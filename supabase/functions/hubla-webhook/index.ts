import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hubla-signature",
};

const DEFAULT_PASSWORD = "Mudar@123";

// Hubla webhook payload structure (adjust based on actual Hubla documentation)
interface HublaWebhookPayload {
  event: string;
  data: {
    customer: {
      email: string;
      name: string;
      phone?: string;
    };
    purchase?: {
      id: string;
      status: string;
      product_id: string;
      product_name: string;
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

    // Validate required fields
    const customerEmail = payload.data?.customer?.email;
    const customerName = payload.data?.customer?.name;
    const eventType = payload.event;

    if (!customerEmail) {
      console.error("Customer email is required");
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only process approved/confirmed purchase events
    // Adjust these event types based on Hubla's actual webhook events
    const validEvents = ["purchase.approved", "purchase.confirmed", "subscription.activated", "sale.approved"];
    if (!validEvents.includes(eventType)) {
      console.log(`Ignoring event type: ${eventType}`);
      return new Response(
        JSON.stringify({ message: `Event ${eventType} ignored` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing ${eventType} for ${customerEmail}`);

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

    if (existingUser) {
      console.log(`User already exists: ${customerEmail}`);
      userId = existingUser.id;
      
      // User already exists, just send a reminder email
      // (they may have forgotten their access)
    } else {
      // Create new user with default password
      console.log(`Creating new user: ${customerEmail}`);
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: DEFAULT_PASSWORD,
        email_confirm: true, // Auto-confirm email
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
      console.log(`User created successfully: ${userId}`);

      // The profile should be created automatically by the trigger
      // But let's update it with the name from Hubla just in case
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          email: customerEmail,
          name: customerName,
        }, { onConflict: "id" });

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // Don't fail the webhook, profile might already exist
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
        loginUrl: "https://app.samiragouvea.com.br/",
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("Error sending welcome email:", emailError);
      // Don't fail the webhook, user was created successfully
    } else {
      console.log("Welcome email sent successfully");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: existingUser ? "User already exists, reminder sent" : "User created and email sent",
        userId 
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
