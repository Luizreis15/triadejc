// Timing-safe HMAC verification used by kiwify-webhook.
// Checkout webhooks from the Kiwify dashboard sign with HMAC-SHA1 in the
// query string (`?signature=`). Header HMAC-SHA256 is also accepted so
// existing tests and any newer senders keep working.

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  const clean = hex.trim().toLowerCase();
  if (clean.length === 0 || clean.length % 2 !== 0 || !/^[0-9a-f]+$/.test(clean)) {
    return null;
  }
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function verifyHmac(
  raw: string,
  header: string | null | undefined,
  secret: string | null | undefined,
  hash: "SHA-1" | "SHA-256",
): Promise<boolean> {
  if (!raw || !header || !secret) return false;

  const signatureBytes = hexToBytes(header);
  if (!signatureBytes) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash },
      false,
      ["verify"],
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(raw),
    );
  } catch {
    return false;
  }
}

/**
 * Verifies `header` is the hex-encoded HMAC-SHA256 of `raw` under `secret`.
 * Fail-closed: any missing input, malformed hex, or mismatch returns false.
 * Never throws.
 */
export async function verifyHmacSha256(
  raw: string,
  header: string | null | undefined,
  secret: string | null | undefined,
): Promise<boolean> {
  return verifyHmac(raw, header, secret, "SHA-256");
}

export async function verifyHmacSha1(
  raw: string,
  header: string | null | undefined,
  secret: string | null | undefined,
): Promise<boolean> {
  return verifyHmac(raw, header, secret, "SHA-1");
}

/** Accepts Kiwify dashboard `?signature=` (SHA-1) or `x-kiwify-signature` (SHA-256 or SHA-1). */
export async function verifyKiwifyRequest(
  req: Request,
  rawBody: string,
  secret: string | null | undefined,
): Promise<boolean> {
  if (!rawBody || !secret) return false;

  const header = req.headers.get("x-kiwify-signature");
  let query: string | null = null;
  try {
    query = new URL(req.url).searchParams.get("signature");
  } catch {
    query = null;
  }

  for (const candidate of [query, header]) {
    if (!candidate) continue;
    if (await verifyHmacSha1(rawBody, candidate, secret)) return true;
    if (await verifyHmacSha256(rawBody, candidate, secret)) return true;
  }
  return false;
}
