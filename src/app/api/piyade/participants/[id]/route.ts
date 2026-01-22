// src/app/api/piyade/participants/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAuthed();

  const { id } = await params;

  try {
    // önce sonuçları sil (foreign key varsa şart)
    await prisma.stageResult.deleteMany({
      where: { participantId: id },
    });

    // sonra katılımcıyı sil
    await prisma.participant.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/piyade/participants/[id] failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
