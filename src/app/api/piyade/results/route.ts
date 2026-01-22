// src/app/api/piyade/results/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

type Row = {
  participantId: string;
  stageId: string;
  valueSec: number | null;
};

export async function GET() {
  await requireAuthed();

  const rows = (await prisma.stageResult.findMany({
    where: { mode: "piyade" },
    orderBy: { createdAt: "asc" },
    select: {
      participantId: true,
      stageId: true,
      valueSec: true,
    },
  })) as Row[];

  // UI repo ile aynı shape: { participantId, stageId, value }
  return NextResponse.json(
    rows.map((r: Row) => ({
      participantId: r.participantId,
      stageId: r.stageId,
      value: r.valueSec ?? null,
    })),
  );
}

export async function POST(req: Request) {
  await requireAuthed();

  const body = (await req.json().catch(() => null)) as {
    participantId?: string;
    stageId?: string;
    value?: number | null;
  } | null;

  const participantId = (body?.participantId ?? "").trim();
  const stageId = (body?.stageId ?? "").trim();
  const value = body?.value ?? null;

  if (!participantId || !stageId) {
    return NextResponse.json(
      { error: "participantId + stageId required" },
      { status: 400 },
    );
  }

  // upsert (unique: mode+participantId+stageId)
  await prisma.stageResult.upsert({
    where: {
      mode_participantId_stageId: {
        mode: "piyade",
        participantId,
        stageId,
      },
    },
    update: {
      valueSec: value,
    },
    create: {
      mode: "piyade",
      participantId,
      stageId,
      valueSec: value,
    },
  });

  return NextResponse.json({ ok: true });
}

// ✅ Katılımcı silerken bağlı tüm sonuçları da silmek için
// resultsRepo.removeParticipant() bunu çağıracak:
// DELETE /api/piyade/results?participantId=xxx
export async function DELETE(req: Request) {
  await requireAuthed();

  const { searchParams } = new URL(req.url);
  const participantId = (searchParams.get("participantId") ?? "").trim();

  if (!participantId) {
    return NextResponse.json(
      { error: "participantId required" },
      { status: 400 },
    );
  }

  await prisma.stageResult.deleteMany({
    where: { mode: "piyade", participantId },
  });

  return NextResponse.json({ ok: true });
}
