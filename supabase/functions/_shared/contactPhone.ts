import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { normalizeBrazilPhone } from "./phone.ts";

/** Celular da aluna: último WhatsApp enviado, depois a compra na Kiwify, depois o cadastro de lead. */
export async function findContactPhone(admin: SupabaseClient, email: string): Promise<string | null> {
  // ilike sem curinga: "_" e "%" de um e-mail valem como letra.
  const target = email.trim().replace(/[\\%_]/g, (char) => `\\${char}`);
  if (!target) return null;

  const { data: outbox } = await admin
    .from("whatsapp_outbox")
    .select("to_phone")
    .ilike("payload->>email", target)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const fromOutbox = normalizeBrazilPhone(typeof outbox?.to_phone === "string" ? outbox.to_phone : "");
  if (fromOutbox) return fromOutbox;

  const { data: purchase } = await admin
    .from("webhook_events")
    .select("mobile:payload->Customer->>mobile")
    .ilike("payload->Customer->>email", target)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const purchaseMobile = (purchase as { mobile?: unknown } | null)?.mobile;
  const fromPurchase = normalizeBrazilPhone(typeof purchaseMobile === "string" ? purchaseMobile : "");
  if (fromPurchase) return fromPurchase;

  const { data: lead } = await admin
    .from("leads")
    .select("phone")
    .ilike("email", target)
    .not("phone", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return normalizeBrazilPhone(typeof lead?.phone === "string" ? lead.phone : "");
}
