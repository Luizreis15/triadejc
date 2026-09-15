import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface GrantParams {
  userId: string;
  productId: string;
  source: string;
  externalId: string;
  amount: number;
  currency: string;
  type: string;
  description?: string;
}

// Upserts the entitlement + transaction pair for a completed payment.
// Both operations are idempotent on replay (unique on user_id+product_id,
// and on provider+external_id respectively) — never revokes here.
export async function grantEntitlementAndTransaction(
  admin: SupabaseClient,
  params: GrantParams,
): Promise<void> {
  const { error: entitlementError } = await admin
    .from("entitlements")
    .upsert(
      {
        user_id: params.userId,
        product_id: params.productId,
        status: "active",
        source: params.source,
        external_id: params.externalId,
      },
      { onConflict: "user_id,product_id" },
    );
  if (entitlementError) throw entitlementError;

  const { error: transactionError } = await admin
    .from("transactions")
    .upsert(
      {
        provider: params.source,
        external_id: params.externalId,
        user_id: params.userId,
        product_id: params.productId,
        amount: params.amount,
        currency: params.currency,
        status: "paid",
        type: params.type,
        description: params.description,
      },
      { onConflict: "provider,external_id" },
    );
  if (transactionError) throw transactionError;
}
