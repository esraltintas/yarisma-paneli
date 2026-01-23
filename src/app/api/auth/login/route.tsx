// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import {
  sessionCookieName,
  sessionCookieValue,
  getAdminPassword,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = String(body?.password ?? "");

  const ok = password === getAdminPassword();

  console.log("ENV CHECK", {
    AUTH_USERNAME: process.env.AUTH_USERNAME,
    AUTH_PASSWORD: process.env.AUTH_PASSWORD ? "***" : undefined,
    AUTH_SECRET: process.env.AUTH_SECRET ? "***" : undefined,
  });
  if (!ok) {
    return NextResponse.json(
      { ok: false, message: "Hatalı şifre" },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });

  // 7 gün
  res.cookies.set(sessionCookieName, sessionCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

// yanlışlıkla GET gelirse 405
export async function GET() {
  return NextResponse.json(
    { ok: false, message: "Method Not Allowed" },
    { status: 405 },
  );
}
