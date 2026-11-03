import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Env vars are read at module top-level, so they must exist before the
// dynamic import below.
Deno.env.set("SUPABASE_URL", "http://localhost:0");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "real-service-role-key");
Deno.env.set("INTERNAL_FUNCTION_SECRET", "test-internal-secret");

const { handler, bearerIsServiceRole } = await import("./index.ts");

function base64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// A syntactically valid JWT whose payload claims service_role, but whose
// signature is never checked by anyone — exactly what a forger would send.
function forgedServiceRoleJwt(): string {
  const header = base64url({ alg: "HS256", typ: "JWT" });
  const payload = base64url({ role: "service_role", iat: 0 });
  return `${header}.${payload}.not-a-real-signature`;
}

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/process-outbox", { method: "POST", headers });
}

// --- bearerIsServiceRole ----------------------------------------------------

Deno.test("bearerIsServiceRole: exact match against the real key passes", () => {
  const req = makeRequest({ Authorization: "Bearer real-service-role-key" });
  assertEquals(bearerIsServiceRole(req), true);
});

Deno.test("bearerIsServiceRole: a forged JWT merely claiming role=service_role is rejected", () => {
  const req = makeRequest({ Authorization: `Bearer ${forgedServiceRoleJwt()}` });
  assertEquals(bearerIsServiceRole(req), false);
});

Deno.test("bearerIsServiceRole: no Authorization header fails closed", () => {
  assertEquals(bearerIsServiceRole(makeRequest()), false);
});

Deno.test("bearerIsServiceRole: wrong token fails closed", () => {
  const req = makeRequest({ Authorization: "Bearer some-other-token" });
  assertEquals(bearerIsServiceRole(req), false);
});

// --- handler auth gate -------------------------------------------------------

Deno.test("handler: no secret, no bearer -> 401", async () => {
  const res = await handler(makeRequest());
  assertEquals(res.status, 401);
});

Deno.test("handler: forged service_role JWT alone (no x-internal-secret) -> 401", async () => {
  // This is the exact regression this fix closes: before, a crafted JWT with
  // an unverified role claim was enough to get past auth.
  const res = await handler(makeRequest({ Authorization: `Bearer ${forgedServiceRoleJwt()}` }));
  assertEquals(res.status, 401);
});

Deno.test("handler: wrong x-internal-secret -> 401", async () => {
  const res = await handler(makeRequest({ "x-internal-secret": "wrong-secret" }));
  assertEquals(res.status, 401);
});
