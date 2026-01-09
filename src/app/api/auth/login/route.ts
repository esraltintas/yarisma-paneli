// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import {
  checkPassword,
  newSessionId,
  sessionCookieName,
  signSessionId,
} from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string };

  if (!body.password || !checkPassword(body.password)) {
    return NextResponse.json(
      { ok: false, message: "Hatalı şifre" },
      { status: 401 }
    );
  }

  const sessionId = newSessionId();
  const cookieValue = signSessionId(sessionId);

  const res = NextResponse.json({ ok: true });

  res.cookies.set({
    name: sessionCookieName(),
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 gün
  });

  return res;
}
