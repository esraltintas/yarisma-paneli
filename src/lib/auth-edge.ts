// src/lib/auth-edge.ts
const COOKIE_NAME = "swat_session";

export function sessionCookieName() {
  return COOKIE_NAME;
}

function secret() {
  return process.env.AUTH_SECRET || "dev-secret";
}

function hexToBytes(hex: string) {
  const len = hex.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: ArrayBuffer) {
  const arr = new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += b.toString(16).padStart(2, "0");
  return s;
}

async function hmacSha256Hex(message: string) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret());
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return bytesToHex(sig);
}

/**
 * Edge runtime compatible verify:
 * cookieValue = `${sessionId}.${hexSig}`
 */
export async function verifySignedSessionId(
  value: string | undefined | null
): Promise<string | null> {
  if (!value) return null;

  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;

  const sessionId = value.slice(0, idx);
  const sigHex = value.slice(idx + 1);

  // basic validation
  if (!sessionId || sigHex.length !== 64) return null;

  const expected = await hmacSha256Hex(sessionId);

  // timing-safe compare-ish (Edge’te timingSafeEqual yok, ama en azından bytes compare)
  const a = hexToBytes(sigHex);
  const b = hexToBytes(expected);
  if (a.length !== b.length) return null;

  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) return null;

  return sessionId;
}
