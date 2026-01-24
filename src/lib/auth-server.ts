// src/lib/auth-server.ts
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthedCookie, sessionCookieName } from "@/lib/auth";

/**
 * Sadece bool döndürür (UI için en güvenlisi)
 */
export async function isAuthed(): Promise<boolean> {
  const c = await cookies(); // ✅ FIX
  const v = c.get(sessionCookieName)?.value;
  return isAuthedCookie(v);
}

/**
 * Page/Layout guard (redirect eder)
 */
export async function requireAuthed(nextPath?: string): Promise<void> {
  const ok = await isAuthed();
  if (ok) return;

  const next = nextPath ? encodeURIComponent(nextPath) : "";
  redirect(next ? `/login?next=${next}` : "/login");
}

/**
 * API guard için özel hata
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "UNAUTHORIZED";
  }
}

/**
 * API route guard (redirect YOK)
 */
export async function requireAuthedApi(): Promise<void> {
  const ok = await isAuthed();
  if (!ok) throw new UnauthorizedError();
}
