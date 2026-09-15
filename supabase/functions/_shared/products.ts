import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const DEFAULT_PRODUCT_SLUG = "jornada_unica";

// Unknown/missing Kiwify SKU always falls back to the single default product —
// never fail the webhook because of an unrecognized product_id.
export async function resolveProductId(
  admin: SupabaseClient,
  kiwifyProductId: string | undefined,
): Promise<string> {
  if (kiwifyProductId) {
    const { data } = await admin
      .from("products")
      .select("id")
      .eq("kiwify_product_id", kiwifyProductId)
      .maybeSingle();
    if (data) return data.id;
  }

  const { data: fallback, error } = await admin
    .from("products")
    .select("id")
    .eq("slug", DEFAULT_PRODUCT_SLUG)
    .single();

  if (error || !fallback) {
    throw new Error(`default product '${DEFAULT_PRODUCT_SLUG}' not found`);
  }
  return fallback.id;
}
