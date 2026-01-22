// src/lib/auth-server.ts
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthedCookie, sessionCookieName } from "@/lib/auth";

/**
 * Sadece bool döndürür (UI için en güvenlisi).
 * AppHeader gibi server component'lerde await edip kullanılır.
 */
export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  const v = c.get(sessionCookieName)?.value;
  return isAuthedCookie(v);
}

/**
 * Redirect eden guard (PAGE / Layout / Server Component'lerde kullan).
 * Auth yoksa login'e atar.
 *
 * Not: API route içinde bunu kullanma -> redirect response yerine crash/garip davranır.
 */
export async function requireAuthed(nextPath?: string): Promise<void> {
  const ok = await isAuthed();
  if (ok) return;

  const next = nextPath ? encodeURIComponent(nextPath) : "";
  redirect(next ? `/login?next=${next}` : "/login");
}

/**
 * API route'lar için: sadece boolean.
 * GET/POST handler içinde kullan.
 */
export async function checkAuthed(): Promise<boolean> {
  return isAuthed();
}

/**
 * API route'lar için guard.
 * Auth yoksa 401 döndürmek istediğin senaryolarda kullanılır.
 */
export async function requireAuthedApi(): Promise<void> {
  const ok = await isAuthed();
  if (!ok) {
    // API içinde redirect istemiyoruz.
    // Handler bunu yakalayıp 401 dönebilir.
    throw new Error("UNAUTHORIZED");
  }
}
