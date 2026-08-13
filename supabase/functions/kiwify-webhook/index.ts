import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as encodeHex } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const KIWIFY_WEBHOOK_TOKEN = Deno.env.get("KIWIFY_WEBHOOK_TOKEN")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-kiwify-signature",
};

const DEFAULT_PASSWORD = "Mudar@123";

// Kiwify webhook payload structure
interface KiwifyWebhookPayload {
  order_id: string;
  order_status: string;
  webhook_event_type?: string;
  Customer: {
    email: string;
    first_name?: string;
    full_name?: string;
    mobile?: string;
  };
  Product?: {
    product_id: string;
    product_name: string;
  };
  Subscription?: {
    id: string;
    status: string;
  };
}

// Verify Kiwify signature using Web Crypto API
async function verifySignature(payload: string, signature: string | null): Promise<boolean> {
  if (!signature || !KIWIFY_WEBHOOK_TOKEN) {
    console.log("Missing signature or token");
    return false;
  }
  
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(KIWIFY_WEBHOOK_TOKEN),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );
    
    const hexSignature = new TextDecoder().decode(encodeHex(new Uint8Array(signatureBuffer)));
    return signature === hexSignature;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log("kiwify-webhook function called");
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
    const rawBody = await req.text();
    const signature = req.headers.get("x-kiwify-signature");
    
    console.log("Received signature:", signature);
    
    // Verify signature (optional - can be disabled for testing)
    if (signature && !verifySignature(rawBody, signature)) {
      console.error("Invalid signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const payload: KiwifyWebhookPayload = JSON.parse(rawBody);
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    const eventType = payload.webhook_event_type || payload.order_status;
    const customerEmail = payload.Customer?.email;
    const customerName = payload.Customer?.full_name || payload.Customer?.first_name || "";

    if (!customerEmail) {
      console.error("Customer email is required. Payload structure:", JSON.stringify(payload, null, 2));
      return new Response(
        JSON.stringify({ error: "Customer email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process relevant Kiwify events
    const validEvents = [
      "order_approved",
      "order_paid",
      "paid",
      "subscription_created",
      "subscription_renewed",
      "subscription_reactivated"
    ];
    
    const isValidEvent = validEvents.includes(eventType) || payload.order_status === "paid";
    
    if (!isValidEvent) {
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

      // Update profile with name from Kiwify
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
        name: customerName,
        source: "kiwify"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in kiwify-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
