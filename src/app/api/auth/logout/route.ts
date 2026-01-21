import { NextResponse } from "next/server";
import { sessionCookieName } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.redirect(
    new URL("/piyade/dashboard", "http://localhost:3000"),
    303,
  );
  res.cookies.set(sessionCookieName, "", { path: "/", maxAge: 0 });
  return res;
}
