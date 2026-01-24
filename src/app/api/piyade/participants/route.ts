// src/app/api/piyade/participants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthedApi, UnauthorizedError } from "@/lib/auth-server";

export async function GET() {
  // ✅ Dashboard da buradan okuyor olabilir -> GET public kalsın
  const items = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" }, // ✅ newest üstte
    select: { id: true, name: true, createdAt: true },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  try {
    await requireAuthedApi();

    const body = (await req.json().catch(() => null)) as {
      name?: string;
    } | null;
    const name = (body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const created = await prisma.participant.create({
      data: { name },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/piyade/participants failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
