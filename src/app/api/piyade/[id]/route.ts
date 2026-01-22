import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAuthed();
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const name = String(body?.name ?? "").trim();
  if (!name)
    return NextResponse.json({ error: "name required" }, { status: 400 });

  const updated = await prisma.participant.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAuthed();
  const { id } = await params;

  await prisma.participant.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
