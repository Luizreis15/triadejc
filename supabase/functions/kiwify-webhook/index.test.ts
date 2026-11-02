import { assertEquals, assertNotEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Env vars are read at module top-level in index.ts, so they must exist
// before the dynamic import below — dummy values are fine, the 401 path
// never reaches anything that uses them for real I/O.
Deno.env.set("SUPABASE_URL", "http://localhost:0");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
Deno.env.set("KIWIFY_WEBHOOK_TOKEN", "test-kiwify-token");

const { handler, claimWebhookEvent, extractAmount } = await import("./index.ts");

async function hmacHex(raw: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function makeRequest(body: string, signature?: string): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (signature !== undefined) headers["x-kiwify-signature"] = signature;
  return new Request("http://localhost/kiwify-webhook", { method: "POST", headers, body });
}

// --- HMAC fail-closed (401) -------------------------------------------------

Deno.test("handler: missing x-kiwify-signature header -> 401", async () => {
  const res = await handler(makeRequest('{"order_id":"1","order_status":"paid","Customer":{"email":"a@b.com"}}'));
  assertEquals(res.status, 401);
});

Deno.test("handler: invalid x-kiwify-signature -> 401", async () => {
  const res = await handler(
    makeRequest('{"order_id":"1","order_status":"paid","Customer":{"email":"a@b.com"}}', "0000deadbeef"),
  );
  assertEquals(res.status, 401);
});

Deno.test("handler: valid HMAC-SHA1 query signature is not rejected as 401", async () => {
  const secret = "test-kiwify-token";
  const body = '{"order_id":"1","order_status":"paid","Customer":{"email":"a@b.com"}}';
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const hex = Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
  const res = await handler(
    new Request(`http://localhost/kiwify-webhook?signature=${hex}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  );
  assertNotEquals(res.status, 401);
});

// --- Replay idempotency (claimWebhookEvent) --------------------------------

interface FakeRow {
  id: string;
  status: string;
}

// Minimal fake matching exactly the query shape claimWebhookEvent uses:
//   .from("webhook_events").select(...).eq("provider", p).eq("event_id", e).maybeSingle()
//   .from("webhook_events").insert({...}).select("id").single()
//   .from("webhook_events").select(...).eq(...).eq(...).single()   (race path)
function makeFakeAdmin(store: Map<string, FakeRow>, opts: { simulateRaceOnce?: boolean } = {}) {
  let raceArmed = !!opts.simulateRaceOnce;

  return {
    from(_table: string) {
      return {
        select(_cols: string) {
          return {
            eq(_c1: string, provider: string) {
              return {
                eq(_c2: string, eventId: string) {
                  const key = `${provider}:${eventId}`;
                  return {
                    maybeSingle: async () => ({ data: store.get(key) ?? null, error: null }),
                    single: async () => {
                      const row = store.get(key);
                      return row
                        ? { data: row, error: null }
                        : { data: null, error: { code: "PGRST116", message: "not found" } };
                    },
                  };
                },
              };
            },
          };
        },
        insert(row: { provider: string; event_id: string; status: string }) {
          return {
            select(_cols: string) {
              return {
                single: async () => {
                  const key = `${row.provider}:${row.event_id}`;
                  if (raceArmed || store.has(key)) {
                    raceArmed = false;
                    return { data: null, error: { code: "23505", message: "duplicate key" } };
                  }
                  const id = crypto.randomUUID();
                  store.set(key, { id, status: row.status });
                  return { data: { id }, error: null };
                },
              };
            },
          };
        },
      };
    },
    // deno-lint-ignore no-explicit-any
  } as any;
}

Deno.test("claimWebhookEvent: first delivery inserts and is not already-processed", async () => {
  const store = new Map<string, FakeRow>();
  const admin = makeFakeAdmin(store);

  const result = await claimWebhookEvent(admin, "order-1:order_approved", "order_approved", { any: "payload" });

  assertEquals(result.alreadyProcessed, false);
  assertEquals(store.size, 1);
});

Deno.test("claimWebhookEvent: replay while still 'received' does not duplicate the row and reprocesses", async () => {
  const store = new Map<string, FakeRow>();
  const admin = makeFakeAdmin(store);

  const first = await claimWebhookEvent(admin, "order-1:order_approved", "order_approved", {});
  const second = await claimWebhookEvent(admin, "order-1:order_approved", "order_approved", {});

  assertEquals(store.size, 1); // one row total, no duplicate insert
  assertEquals(first.rowId, second.rowId);
  assertEquals(second.alreadyProcessed, false); // status is still 'received' -> caller should retry the grant
});

Deno.test("claimWebhookEvent: replay of an already-'processed' event short-circuits", async () => {
  const store = new Map<string, FakeRow>();
  const admin = makeFakeAdmin(store);

  const first = await claimWebhookEvent(admin, "order-1:order_approved", "order_approved", {});
  store.set("kiwify:order-1:order_approved", { id: first.rowId, status: "processed" });

  const replay = await claimWebhookEvent(admin, "order-1:order_approved", "order_approved", {});

  assertEquals(replay.alreadyProcessed, true);
  assertEquals(replay.rowId, first.rowId);
  assertEquals(store.size, 1); // still no duplicate row
});

Deno.test("claimWebhookEvent: concurrent insert race (23505) falls back to the winning row", async () => {
  const store = new Map<string, FakeRow>();
  const admin = makeFakeAdmin(store, { simulateRaceOnce: true });

  // Pretend another request already claimed this event_id between our SELECT
  // and our INSERT — pre-seed the row so the race-recovery SELECT finds it.
  store.set("kiwify:order-2:order_approved", { id: "already-claimed-by-other-request", status: "received" });

  const result = await claimWebhookEvent(admin, "order-2:order_approved", "order_approved", {});

  assertEquals(result.rowId, "already-claimed-by-other-request");
  assertEquals(result.alreadyProcessed, false);
  assertEquals(store.size, 1);
});

Deno.test("claimWebhookEvent: different eventType for the same order_id is a distinct event", async () => {
  const store = new Map<string, FakeRow>();
  const admin = makeFakeAdmin(store);

  const approved = await claimWebhookEvent(admin, "order-3:order_approved", "order_approved", {});
  const renewed = await claimWebhookEvent(admin, "order-3:subscription_renewed", "subscription_renewed", {});

  assertNotEquals(approved.rowId, renewed.rowId);
  assertEquals(store.size, 2);
});

// --- extractAmount (best-effort amount parsing) -----------------------------

Deno.test("extractAmount: Commissions.charge_amount is in cents", () => {
  assertEquals(extractAmount({ Commissions: { charge_amount: 9700 } } as never), 97);
});

Deno.test("extractAmount: falls back to 0 when nothing present", () => {
  assertEquals(extractAmount({} as never), 0);
});
