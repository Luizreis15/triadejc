import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { normalizeBrazilPhone } from "./phone.ts";
import { senderPhones } from "./senderPhone.ts";

function firstUsable(values: unknown[], blocked: Set<string>): string | null {
  for (const value of values) {
    const phone = normalizeBrazilPhone(typeof value === "string" ? value : "");
    if (phone && !blocked.has(phone)) return phone;
  }
  return null;
}

/**
 * Celular da aluna: último WhatsApp enviado, depois a compra na Kiwify, depois o cadastro de lead.
 * O número da SDR (o que dispara) é pulado em todas as fontes.
 */
export async function findContactPhone(admin: SupabaseClient, email: string): Promise<string | null> {
  // ilike sem curinga: "_" e "%" de um e-mail valem como letra.
  const target = email.trim().replace(/[\\%_]/g, (char) => `\\${char}`);
  if (!target) return null;
  const blocked = await senderPhones(admin);

  const { data: outbox } = await admin
    .from("whatsapp_outbox")
    .select("to_phone")
    .ilike("payload->>email", target)
    .order("created_at", { ascending: false })
    .limit(20);
  const fromOutbox = firstUsable((outbox ?? []).map((row) => row.to_phone), blocked);
  if (fromOutbox) return fromOutbox;

  const { data: purchases } = await admin
    .from("webhook_events")
    .select("mobile:payload->Customer->>mobile")
    .ilike("payload->Customer->>email", target)
    .order("created_at", { ascending: false })
    .limit(20);
  const fromPurchase = firstUsable((purchases ?? []).map((row) => (row as { mobile?: unknown }).mobile), blocked);
  if (fromPurchase) return fromPurchase;

  const { data: leads } = await admin
    .from("leads")
    .select("phone")
    .ilike("email", target)
    .not("phone", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);
  return firstUsable((leads ?? []).map((row) => row.phone), blocked);
}
