import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export async function enqueueWelcomeWhatsApp(
  admin: SupabaseClient,
  params: { phone: string; userId: string; name: string; email: string; actionLink: string },
): Promise<void> {
  const { error } = await admin.from("whatsapp_outbox").insert({
    kind: "welcome",
    to_phone: params.phone,
    payload: {
      name: params.name,
      email: params.email,
      actionLink: params.actionLink,
    },
    status: "queued",
    idempotency_key: `welcome:${params.userId}`,
  });
  if (error?.code === "23505") return;
  if (error) throw error;
}
