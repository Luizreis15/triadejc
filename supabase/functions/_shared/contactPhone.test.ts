import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { findContactPhone } from "./contactPhone.ts";

type Tables = Record<string, unknown[]>;

/** Imita só o encadeamento que a busca usa: from().select()...limit() / maybeSingle(). */
function fakeAdmin(tables: Tables) {
  return {
    from: (table: string) => {
      const rows = tables[table] ?? [];
      const chain: Record<string, unknown> = {};
      for (const method of ["select", "ilike", "eq", "not", "order"]) chain[method] = () => chain;
      chain.limit = () => Promise.resolve({ data: rows, error: null });
      chain.maybeSingle = () => Promise.resolve({ data: rows[0] ?? null, error: null });
      return chain;
    },
  } as unknown as SupabaseClient;
}

Deno.test("findContactPhone pula o número da SDR e usa o seguinte", async () => {
  const admin = fakeAdmin({
    whatsapp_connection: [{ phone_e164: null }],
    whatsapp_outbox: [{ to_phone: "551128667666" }, { to_phone: "5511983751042" }],
  });
  assertEquals(await findContactPhone(admin, "aluna@exemplo.com"), "5511983751042");
});

Deno.test("findContactPhone não devolve o número salvo na conexão", async () => {
  const admin = fakeAdmin({
    whatsapp_connection: [{ phone_e164: "5511999990000" }],
    whatsapp_outbox: [{ to_phone: "5511999990000" }],
    webhook_events: [{ mobile: "(11) 95237-0818" }],
  });
  assertEquals(await findContactPhone(admin, "aluna@exemplo.com"), "5511952370818");
});

Deno.test("findContactPhone devolve null quando só há o número da SDR", async () => {
  const admin = fakeAdmin({
    whatsapp_connection: [{ phone_e164: null }],
    whatsapp_outbox: [{ to_phone: "551128667666" }],
    leads: [{ phone: "11 2866-7666" }],
  });
  assertEquals(await findContactPhone(admin, "aluna@exemplo.com"), null);
});
