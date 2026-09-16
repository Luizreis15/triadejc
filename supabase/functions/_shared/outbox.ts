import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Live schema (owner migration 20260915233000):
//   to_email, status IN ('queued','sent','failed'), idempotency_key UNIQUE,
//   next_attempt_at, rpc claim_email_outbox(_limit, _kind).

export interface OutboxRow {
  id: string;
  kind: string;
  recipient_email: string;
  payload: Record<string, unknown>;
  status: "queued" | "sent" | "failed";
  attempts: number;
}

export interface EnqueueEmailParams {
  kind: string;
  recipientEmail: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

function asPayload(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export async function enqueueEmail(admin: SupabaseClient, params: EnqueueEmailParams): Promise<void> {
  const { error } = await admin.from("email_outbox").insert({
    kind: params.kind,
    to_email: params.recipientEmail,
    payload: params.payload,
    status: "queued",
    idempotency_key: params.idempotencyKey ?? `${params.kind}:${params.recipientEmail}`,
  });
  if (error?.code === "23505") return;
  if (error) throw error;
}

export async function hasPendingEmail(
  admin: SupabaseClient,
  kind: string,
  recipientEmail: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("email_outbox")
    .select("id")
    .eq("kind", kind)
    .eq("to_email", recipientEmail)
    .eq("status", "queued")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

interface ClaimEmailOutboxRow {
  id: string;
  kind: string;
  to_email: string;
  payload: unknown;
  status: string;
  attempts: number;
}

export async function claimPendingEmails(
  admin: SupabaseClient,
  kind: string,
  limit = 20,
): Promise<OutboxRow[]> {
  const { data, error } = await admin.rpc("claim_email_outbox", { _limit: limit, _kind: kind });
  if (error) throw error;

  return ((data ?? []) as ClaimEmailOutboxRow[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    recipient_email: row.to_email,
    payload: asPayload(row.payload),
    status: row.status as OutboxRow["status"],
    attempts: row.attempts,
  }));
}

export async function markEmailSent(admin: SupabaseClient, id: string): Promise<void> {
  const { error } = await admin
    .from("email_outbox")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("_shared/outbox: failed to mark sent", error.message);
}

const BACKOFF_SECONDS = [3600, 86400, 259200];

export async function markEmailFailed(
  admin: SupabaseClient,
  id: string,
  previousAttempts: number,
  errorMessage: string,
): Promise<void> {
  const delay = BACKOFF_SECONDS[Math.min(Math.max(previousAttempts - 1, 0), BACKOFF_SECONDS.length - 1)];
  const nextAttemptAt = new Date(Date.now() + delay * 1000).toISOString();
  const status = previousAttempts >= 8 ? "failed" : "queued";
  const { error } = await admin
    .from("email_outbox")
    .update({
      status,
      last_error: errorMessage,
      next_attempt_at: nextAttemptAt,
    })
    .eq("id", id);
  if (error) console.error("_shared/outbox: failed to mark failed", error.message);
}
