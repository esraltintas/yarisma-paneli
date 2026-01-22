import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

export async function GET() {
  await requireAuthed();
  const rows = await prisma.stageResult.findMany({
    where: { mode: "piyade" },
  });

  // UI repo ile uyumlu shape
  return NextResponse.json(
    rows.map((r) => ({
      participantId: r.participantId,
      stageId: r.stageId,
      value: r.valueSec ?? null,
    })),
  );
}

export async function PUT(req: Request) {
  await requireAuthed();
  const body = await req.json().catch(() => null);

  const participantId = String(body?.participantId ?? "");
  const stageId = String(body?.stageId ?? "");
  const raw = body?.value;

  if (!participantId || !stageId) {
    return NextResponse.json(
      { error: "participantId & stageId required" },
      { status: 400 },
    );
  }

  // ✅ eksi girilemesin (negatifse null’a çekiyoruz)
  let value: number | null = null;
  if (raw !== null && raw !== undefined && raw !== "") {
    const n = Number(raw);
    value = Number.isFinite(n) && n >= 0 ? n : null;
  }

  const saved = await prisma.stageResult.upsert({
    where: {
      mode_participantId_stageId: { mode: "piyade", participantId, stageId },
    },
    update: { valueSec: value },
    create: { mode: "piyade", participantId, stageId, valueSec: value },
  });

  return NextResponse.json({
    participantId: saved.participantId,
    stageId: saved.stageId,
    value: saved.valueSec ?? null,
  });
}
