// src/lib/auth.ts
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const COOKIE_NAME = "swat_session";

function secret() {
  return process.env.AUTH_SECRET || "dev-secret";
}

export function sessionCookieName() {
  return COOKIE_NAME;
}

export function checkPassword(input: string) {
  const real = process.env.AUTH_PASSWORD || "";
  try {
    return timingSafeEqual(Buffer.from(input), Buffer.from(real));
  } catch {
    return false;
  }
}

export function newSessionId() {
  return randomBytes(24).toString("hex");
}

export function signSessionId(sessionId: string) {
  const sig = createHmac("sha256", secret()).update(sessionId).digest("hex");
  return `${sessionId}.${sig}`;
}

export function verifySignedSessionId(
  value: string | undefined | null
): string | null {
  if (!value) return null;
  const idx = value.lastIndexOf(".");
  if (idx <= 0) return null;

  const sessionId = value.slice(0, idx);
  const sig = value.slice(idx + 1);

  const expected = createHmac("sha256", secret())
    .update(sessionId)
    .digest("hex");

  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return sessionId;
  } catch {
    return null;
  }
}
