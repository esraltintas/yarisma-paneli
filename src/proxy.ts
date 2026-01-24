// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName, isAuthedCookie } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ sadece admin sayfaları koru
  // Senin yapında admin path şu: /piyade/(admin)/participants
  // URL'de (admin) görünmez; gerçek path: /piyade/participants
  const isAdminRoute = pathname.startsWith("/piyade/participants");

  if (!isAdminRoute) return NextResponse.next();

  const cookie = req.cookies.get(sessionCookieName)?.value;

  // ✅ isAuthedCookie async ise await et
  const authed = await isAuthedCookie(cookie);

  if (authed) return NextResponse.next();

  // login'e yolla + geri dönüş için next paramı
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/piyade/participants/:path*"],
};
