import { assertEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { claimPendingEmails, enqueueEmail, hasPendingEmail } from "./outbox.ts";

interface FakeOutboxRow {
  idempotency_key: string;
  kind: string;
  to_email: string;
  status: string;
}

// Mirrors the real UNIQUE(idempotency_key) constraint on email_outbox: a
// second insert with the same key returns a Postgres 23505 error, exactly
// like the live table would.
function makeFakeAdmin(rows: FakeOutboxRow[]) {
  return {
    from(_table: string) {
      return {
        insert(row: { kind: string; to_email: string; payload: unknown; status: string; idempotency_key: string }) {
          const duplicate = rows.some((r) => r.idempotency_key === row.idempotency_key);
          if (duplicate) {
            return Promise.resolve({ error: { code: "23505", message: "duplicate key value" } });
          }
          rows.push({
            idempotency_key: row.idempotency_key,
            kind: row.kind,
            to_email: row.to_email,
            status: row.status,
          });
          return Promise.resolve({ error: null });
        },
        select(_cols: string) {
          return {
            eq(_c1: string, kind: string) {
              return {
                eq(_c2: string, toEmail: string) {
                  return {
                    eq(_c3: string, status: string) {
                      return {
                        limit(_n: number) {
                          return {
                            maybeSingle: async () => {
                              const match = rows.find(
                                (r) => r.kind === kind && r.to_email === toEmail && r.status === status,
                              );
                              return { data: match ? { id: match.idempotency_key } : null, error: null };
                            },
                          };
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
        // deno-lint-ignore no-explicit-any
      } as any;
    },
    // deno-lint-ignore no-explicit-any
  } as any;
}

Deno.test("enqueueEmail: first enqueue with an idempotency_key succeeds", async () => {
  const rows: FakeOutboxRow[] = [];
  const admin = makeFakeAdmin(rows);

  await enqueueEmail(admin, {
    kind: "welcome",
    recipientEmail: "a@b.com",
    payload: {},
    idempotencyKey: "welcome:user-123",
  });

  assertEquals(rows.length, 1);
  assertEquals(rows[0].idempotency_key, "welcome:user-123");
});

Deno.test("enqueueEmail: replay with the same idempotency_key is a silent no-op (23505 swallowed)", async () => {
  const rows: FakeOutboxRow[] = [];
  const admin = makeFakeAdmin(rows);

  const params = { kind: "welcome", recipientEmail: "a@b.com", payload: {}, idempotencyKey: "welcome:user-123" };
  await enqueueEmail(admin, params);
  await enqueueEmail(admin, params); // replay of the same webhook event
  await enqueueEmail(admin, params); // and again

  assertEquals(rows.length, 1); // never duplicated
});

Deno.test("enqueueEmail: defaults idempotency_key to kind:recipientEmail when not given", async () => {
  const rows: FakeOutboxRow[] = [];
  const admin = makeFakeAdmin(rows);

  await enqueueEmail(admin, { kind: "abandoned_cart_reminder_1h", recipientEmail: "lead@example.com", payload: {} });
  await enqueueEmail(admin, { kind: "abandoned_cart_reminder_1h", recipientEmail: "lead@example.com", payload: {} });

  assertEquals(rows.length, 1);
  assertEquals(rows[0].idempotency_key, "abandoned_cart_reminder_1h:lead@example.com");
});

Deno.test("enqueueEmail: a non-duplicate error is not swallowed", async () => {
  const admin = {
    from() {
      return {
        insert: () => Promise.resolve({ error: { code: "42P01", message: "relation does not exist" } }),
        // deno-lint-ignore no-explicit-any
      } as any;
    },
    // deno-lint-ignore no-explicit-any
  } as any;

  await assertRejects(() => enqueueEmail(admin, { kind: "welcome", recipientEmail: "a@b.com", payload: {} }));
});

Deno.test("claimPendingEmails: calls the claim_email_outbox rpc and maps to_email -> recipient_email", async () => {
  let calledWith: { _limit: number; _kind: string } | null = null;
  const admin = {
    rpc(_fn: string, args: { _limit: number; _kind: string }) {
      calledWith = args;
      return Promise.resolve({
        data: [{ id: "row-1", kind: "welcome", to_email: "a@b.com", payload: { name: "Ana" }, status: "queued", attempts: 0 }],
        error: null,
      });
    },
    // deno-lint-ignore no-explicit-any
  } as any;

  const rows = await claimPendingEmails(admin, "welcome", 5);

  assertEquals(calledWith, { _limit: 5, _kind: "welcome" });
  assertEquals(rows, [
    { id: "row-1", kind: "welcome", recipient_email: "a@b.com", payload: { name: "Ana" }, status: "queued", attempts: 0 },
  ]);
});

Deno.test("claimPendingEmails: coerces a non-object payload to {} instead of throwing", async () => {
  const admin = {
    rpc() {
      return Promise.resolve({
        data: [{ id: "row-1", kind: "welcome", to_email: "a@b.com", payload: null, status: "queued", attempts: 0 }],
        error: null,
      });
    },
    // deno-lint-ignore no-explicit-any
  } as any;

  const rows = await claimPendingEmails(admin, "welcome");
  assertEquals(rows[0].payload, {});
});

Deno.test("hasPendingEmail: finds a queued row for the same kind+recipient", async () => {
  const rows: FakeOutboxRow[] = [
    { idempotency_key: "abandoned_cart_reminder_1h:lead@example.com", kind: "abandoned_cart_reminder_1h", to_email: "lead@example.com", status: "queued" },
  ];
  const admin = makeFakeAdmin(rows);

  assertEquals(await hasPendingEmail(admin, "abandoned_cart_reminder_1h", "lead@example.com"), true);
  assertEquals(await hasPendingEmail(admin, "abandoned_cart_reminder_1h", "someone-else@example.com"), false);
});
