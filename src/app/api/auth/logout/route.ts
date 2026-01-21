import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url));

  res.cookies.set(sessionCookieName(), "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
