// src/app/api/piyade/results/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthed } from "@/lib/auth-server";

type Mode = "piyade"; // şimdilik

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") as Mode) ?? "piyade";

  try {
    const rows = await prisma.stageResult.findMany({
      where: { mode },
      select: {
        participantId: true,
        stageId: true,
        valueSec: true,
      },
    });

    // UI repo ile uyumlu shape
    return NextResponse.json(
      rows.map((r) => ({
        participantId: r.participantId,
        stageId: r.stageId,
        value: r.valueSec ?? null,
      })),
    );
  } catch (e) {
    console.error("GET /api/piyade/results failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await requireAuthed(); // ❗️admin şart

  try {
    const body = (await req.json().catch(() => null)) as {
      mode?: Mode;
      participantId?: string;
      stageId?: string;
      value?: number | null;
    } | null;

    const mode = body?.mode ?? "piyade";
    const participantId = body?.participantId ?? "";
    const stageId = body?.stageId ?? "";
    const value = body?.value ?? null;

    if (!participantId || !stageId) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    await prisma.stageResult.upsert({
      where: {
        mode_participantId_stageId: { mode, participantId, stageId },
      },
      create: {
        mode,
        participantId,
        stageId,
        valueSec: value,
      },
      update: {
        valueSec: value,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/piyade/results failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await requireAuthed(); // ❗️admin şart

  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") as Mode) ?? "piyade";
  const participantId = url.searchParams.get("participantId") ?? "";

  if (!participantId) {
    return NextResponse.json(
      { error: "participantId required" },
      { status: 400 },
    );
  }

  try {
    await prisma.stageResult.deleteMany({
      where: { mode, participantId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/piyade/results failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
