// proxy.ts (Next.js 16+)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isAuthedCookie, sessionCookieName } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // sadece admin route + write api korunacak
  const isParticipantsPage = pathname.startsWith("/piyade/participants");
  const isParticipantsApi = pathname.startsWith("/api/piyade/participants");
  const isResultsApi = pathname.startsWith("/api/piyade/results");

  // sadece POST/PUT/PATCH/DELETE gibi yazma işlemlerinde results API auth ister
  const method = req.method.toUpperCase();
  const isWriteMethod = method !== "GET";

  const isAdminRoute =
    isParticipantsPage ||
    (isParticipantsApi && isWriteMethod) ||
    (isResultsApi && isWriteMethod);

  if (!isAdminRoute) return NextResponse.next();

  const cookie = req.cookies.get(sessionCookieName)?.value;
  const authed = await isAuthedCookie(cookie); // ✅ await şart

  if (authed) return NextResponse.next();

  // login'e yönlendir + next paramı
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/piyade/participants/:path*", "/api/piyade/:path*"],
};
