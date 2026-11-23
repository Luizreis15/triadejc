import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SITE = "https://www.jordanacantarelli.com.br";
// Sem letras que se confundem (i, l, o, 0, 1) para quem digitar o link à mão.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const TYPES = new Set(["recovery", "invite", "magiclink", "signup"]);

function randomCode(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

/**
 * Troca o link longo do Supabase (/auth/v1/verify?token=...&type=...) por SITE/a/<código>.
 * Se algo falhar, devolve o link original: ele continua funcionando, só é feio.
 */
export async function shortAccessLink(admin: SupabaseClient, actionLink: string): Promise<string> {
  try {
    const url = new URL(actionLink);
    const tokenHash = url.searchParams.get("token") ?? "";
    const linkType = url.searchParams.get("type") ?? "";
    if (!tokenHash || !TYPES.has(linkType)) return actionLink;
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = randomCode();
      const { error } = await admin.from("access_links").insert({ code, token_hash: tokenHash, link_type: linkType });
      if (!error) return `${SITE}/a/${code}`;
      if (error.code !== "23505") {
        console.error("accessLink: insert failed", error.code ?? "unknown");
        return actionLink;
      }
    }
    return actionLink;
  } catch {
    return actionLink;
  }
}
