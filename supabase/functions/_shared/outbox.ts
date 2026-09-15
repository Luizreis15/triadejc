import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Requires the `email_outbox` table — NOT YET MIGRATED as of P2. Requested
// from the owner; see PR description. Proposed shape:
//
//   create table public.email_outbox (
//     id uuid primary key default gen_random_uuid(),
//     kind text not null,                 -- 'welcome' | 'abandoned_cart_reminder_1h' | ...
//     recipient_email text not null,
//     payload jsonb not null default '{}',
//     status text not null default 'pending' check (status in ('pending','sent','failed')),
//     attempts int not null default 0,
//     last_error text,
//     created_at timestamptz not null default now(),
//     sent_at timestamptz
//   );
//   create index email_outbox_pending_idx on public.email_outbox (kind, status, created_at)
//     where status = 'pending';
//
// Until that migration lands, every function in this module will fail with
// a Postgres "relation does not exist" error — callers must not treat that
// as fatal to their own critical path (see kiwify-webhook's use).

export interface OutboxRow {
  id: string;
  kind: string;
  recipient_email: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  attempts: number;
}

export interface EnqueueEmailParams {
  kind: string;
  recipientEmail: string;
  payload: Record<string, unknown>;
}

export async function enqueueEmail(admin: SupabaseClient, params: EnqueueEmailParams): Promise<void> {
  const { error } = await admin.from("email_outbox").insert({
    kind: params.kind,
    recipient_email: params.recipientEmail,
    payload: params.payload,
    status: "pending",
  });
  if (error) throw error;
}

// True if a pending (not yet resolved) row already exists for this
// kind+recipient — use before enqueueing to avoid piling up duplicate
// attempts for the same recipient across repeated invocations (e.g. cron).
export async function hasPendingEmail(
  admin: SupabaseClient,
  kind: string,
  recipientEmail: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("email_outbox")
    .select("id")
    .eq("kind", kind)
    .eq("recipient_email", recipientEmail)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function claimPendingEmails(
  admin: SupabaseClient,
  kind: string,
  limit = 20,
): Promise<OutboxRow[]> {
  const { data, error } = await admin
    .from("email_outbox")
    .select("id, kind, recipient_email, payload, status, attempts")
    .eq("kind", kind)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function markEmailSent(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin
    .from("email_outbox")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("_shared/outbox: failed to mark sent", id, error.message);
}

const MAX_ATTEMPTS = 5;

// Failure sets status back to 'pending' so the next run retries, unless
// attempts have exhausted MAX_ATTEMPTS — then it becomes terminal 'failed'.
export async function markEmailFailed(
  admin: SupabaseClient,
  id: string,
  previousAttempts: number,
  errorMessage: string,
): Promise<void> {
  const attempts = previousAttempts + 1;
  const status = attempts >= MAX_ATTEMPTS ? "failed" : "pending";
  const { error } = await admin
    .from("email_outbox")
    .update({ status, attempts, last_error: errorMessage })
    .eq("id", id);
  if (error) console.error("_shared/outbox: failed to mark failed", id, error.message);
}
