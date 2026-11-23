import { assert, assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { shortAccessLink } from "./accessLink.ts";

const LONG = "https://spxxlspesoybioowvjmb.supabase.co/auth/v1/verify?token=abc123&type=recovery&redirect_to=https://www.jordanacantarelli.com.br/membros/reset-password";

function fakeAdmin(errors: Array<{ code: string } | null>) {
  const inserted: Record<string, unknown>[] = [];
  const admin = {
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        inserted.push(row);
        return Promise.resolve({ error: errors.shift() ?? null });
      },
    }),
  } as unknown as SupabaseClient;
  return { admin, inserted };
}

Deno.test("shortAccessLink troca o link longo por /a/<código>", async () => {
  const { admin, inserted } = fakeAdmin([null]);
  const link = await shortAccessLink(admin, LONG);
  assert(/^https:\/\/www\.jordanacantarelli\.com\.br\/a\/[a-z0-9]{10}$/.test(link), link);
  assertEquals(inserted[0].token_hash, "abc123");
  assertEquals(inserted[0].link_type, "recovery");
  assertEquals(link.endsWith(String(inserted[0].code)), true);
});

Deno.test("shortAccessLink tenta outro código se o primeiro já existe", async () => {
  const { admin, inserted } = fakeAdmin([{ code: "23505" }, null]);
  const link = await shortAccessLink(admin, LONG);
  assertEquals(inserted.length, 2);
  assert(link.includes("/a/"));
});

Deno.test("shortAccessLink devolve o link original se a tabela falhar", async () => {
  const { admin } = fakeAdmin([{ code: "42P01" }]);
  assertEquals(await shortAccessLink(admin, LONG), LONG);
});

Deno.test("shortAccessLink não mexe em link sem token", async () => {
  const { admin, inserted } = fakeAdmin([null]);
  assertEquals(await shortAccessLink(admin, "https://www.jordanacantarelli.com.br/membros"), "https://www.jordanacantarelli.com.br/membros");
  assertEquals(inserted.length, 0);
});
