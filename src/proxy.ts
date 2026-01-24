// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthedCookie, sessionCookieName } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isParticipantsPage = pathname.startsWith("/piyade/participants");

  const isParticipantsApi = pathname.startsWith("/api/piyade/participants");
  const isResultsApi = pathname.startsWith("/api/piyade/results");

  const method = req.method.toUpperCase();
  const isWriteMethod =
    method !== "GET" && method !== "HEAD" && method !== "OPTIONS";

  // ✅ Korunan alanlar:
  // - /piyade/participants (page) -> her zaman auth
  // - /api/piyade/participants & /api/piyade/results -> sadece WRITE auth
  const mustBeAuthed =
    isParticipantsPage ||
    ((isParticipantsApi || isResultsApi) && isWriteMethod);

  if (!mustBeAuthed) return NextResponse.next();

  const cookie = req.cookies.get(sessionCookieName)?.value;
  const authed = isAuthedCookie(cookie);

  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/piyade/participants/:path*", "/api/piyade/:path*"],
};
