import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { verifyHmacSha256, verifyKiwifyRequest } from "./crypto.ts";

async function hmacHex(raw: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.test("verifyHmacSha256: correct signature verifies", async () => {
  const raw = '{"order_id":"abc"}';
  const secret = "test-secret";
  const header = await hmacHex(raw, secret);
  assertEquals(await verifyHmacSha256(raw, header, secret), true);
});

Deno.test("verifyHmacSha256: wrong signature is rejected", async () => {
  const raw = '{"order_id":"abc"}';
  const secret = "test-secret";
  const wrongHeader = await hmacHex(raw, "a-different-secret");
  assertEquals(await verifyHmacSha256(raw, wrongHeader, secret), false);
});

Deno.test("verifyHmacSha256: tampered body is rejected", async () => {
  const secret = "test-secret";
  const header = await hmacHex('{"order_id":"abc"}', secret);
  assertEquals(await verifyHmacSha256('{"order_id":"tampered"}', header, secret), false);
});

Deno.test("verifyHmacSha256: missing header fails closed", async () => {
  assertEquals(await verifyHmacSha256('{"a":1}', null, "secret"), false);
  assertEquals(await verifyHmacSha256('{"a":1}', undefined, "secret"), false);
  assertEquals(await verifyHmacSha256('{"a":1}', "", "secret"), false);
});

Deno.test("verifyHmacSha256: missing secret fails closed", async () => {
  const header = await hmacHex('{"a":1}', "whatever");
  assertEquals(await verifyHmacSha256('{"a":1}', header, null), false);
  assertEquals(await verifyHmacSha256('{"a":1}', header, undefined), false);
  assertEquals(await verifyHmacSha256('{"a":1}', header, ""), false);
});

Deno.test("verifyHmacSha256: malformed hex header fails closed, does not throw", async () => {
  assertEquals(await verifyHmacSha256('{"a":1}', "not-hex-at-all!!", "secret"), false);
  assertEquals(await verifyHmacSha256('{"a":1}', "abc", "secret"), false); // odd length
});

async function hmacSha1Hex(raw: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.test("verifyKiwifyRequest: dashboard query signature HMAC-SHA1 verifies", async () => {
  const raw = '{"order_id":"abc"}';
  const secret = "atg-token";
  const signature = await hmacSha1Hex(raw, secret);
  const req = new Request(`http://localhost/kiwify-webhook?signature=${signature}`, {
    method: "POST",
    body: raw,
  });
  assertEquals(await verifyKiwifyRequest(req, raw, secret), true);
});

Deno.test("verifyKiwifyRequest: header HMAC-SHA256 still verifies", async () => {
  const raw = '{"order_id":"abc"}';
  const secret = "test-secret";
  const header = await hmacHex(raw, secret);
  const req = new Request("http://localhost/kiwify-webhook", {
    method: "POST",
    headers: { "x-kiwify-signature": header },
    body: raw,
  });
  assertEquals(await verifyKiwifyRequest(req, raw, secret), true);
});

Deno.test("verifyKiwifyRequest: missing header and query fails closed", async () => {
  const req = new Request("http://localhost/kiwify-webhook", { method: "POST", body: "{}" });
  assertEquals(await verifyKiwifyRequest(req, "{}", "secret"), false);
});
