import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName, verifySignedSessionId } from "@/lib/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // serbest
  if (pathname.startsWith("/login")) return NextResponse.next();
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // sadece /piyade/* korunsun
  if (pathname.startsWith("/piyade")) {
    const raw = req.cookies.get(sessionCookieName())?.value;
    const sessionId = await verifySignedSessionId(raw);

    if (!sessionId) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/piyade/:path*"],
};
