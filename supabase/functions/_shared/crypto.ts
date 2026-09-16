// Timing-safe HMAC-SHA256 verification used by kiwify-webhook.
// Uses crypto.subtle.verify (not a manual digest + string compare) so the
// comparison itself is constant-time — no hand-rolled timing-safe-equal needed.

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
  if (!raw || !header || !secret) return false;

  const signatureBytes = hexToBytes(header);
  if (!signatureBytes) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
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
