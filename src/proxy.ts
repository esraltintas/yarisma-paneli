// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName, isAuthedCookie } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/piyade/participants");
  if (!isAdminRoute) return NextResponse.next();

  const cookie = req.cookies.get(sessionCookieName)?.value;

  // cookie yoksa direkt login
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ✅ async doğrula
  const authed = await isAuthedCookie(cookie);

  if (authed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/piyade/participants/:path*"],
};
