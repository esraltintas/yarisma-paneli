// src/lib/auth-server.ts
import { cookies } from "next/headers";
import { sessionCookieName, isAuthedCookie } from "@/lib/auth";

export async function requireAuthed(): Promise<boolean> {
  const store = await cookies(); // Next 15+ async
  const cookie = store.get(sessionCookieName)?.value ?? null;
  return isAuthedCookie(cookie);
}
