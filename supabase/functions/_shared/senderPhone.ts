import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { normalizeBrazilPhone } from "./phone.ts";

// WhatsApp da SDR virtual, que dispara os acessos. Nunca é celular de aluna.
export const SDR_PHONE = "551128667666";

/** Números que só enviam: o da SDR e o salvo na conexão do Uazapi. */
export async function senderPhones(admin: SupabaseClient): Promise<Set<string>> {
  const blocked = new Set([SDR_PHONE]);
  const { data } = await admin.from("whatsapp_connection").select("phone_e164").eq("id", 1).maybeSingle();
  const own = normalizeBrazilPhone(typeof data?.phone_e164 === "string" ? data.phone_e164 : "");
  if (own) blocked.add(own);
  return blocked;
}
