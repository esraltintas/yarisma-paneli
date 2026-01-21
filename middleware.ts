import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/piyade/participants/:path*"],
};

export function middleware(req: NextRequest) {
  const session = req.cookies.get("swat_session")?.value;

  // login değilse login sayfasına at
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
