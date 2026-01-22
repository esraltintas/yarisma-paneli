// src/app/api/piyade/participants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

export async function GET() {
  await requireAuthed();
  const items = await prisma.participant.findMany({
    where: { mode: "piyade" }, // eğer modelde mode varsa
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await requireAuthed();

  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = (body?.name ?? "").trim(); // ✅ name buradan gelecek

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const created = await prisma.participant.create({
    data: {
      name, // ✅ kesinlikle name
      mode: "piyade", // eğer schema’da mode alanın varsa
    },
    select: { id: true, name: true },
  });

  return NextResponse.json(created, { status: 201 });
}
