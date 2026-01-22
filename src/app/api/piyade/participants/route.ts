// src/app/api/piyade/participants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

export async function GET() {
  const authed = await requireAuthed();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.participant.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/piyade/participants failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authed = await requireAuthed();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => null)) as {
      name?: string;
    } | null;
    const name = (body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const created = await prisma.participant.create({
      data: { name },
      select: { id: true, name: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("POST /api/piyade/participants failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
