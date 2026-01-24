import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthedApi, UnauthorizedError } from "@/lib/auth-server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAuthedApi();

    const { id } = await ctx.params; // ✅ params Promise -> await
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as {
      name?: string;
    } | null;
    const name = (body?.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const updated = await prisma.participant.update({
      where: { id },
      data: { name },
      select: { id: true, name: true, createdAt: true },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("PATCH /api/piyade/participants/[id] failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireAuthedApi();

    const { id } = await ctx.params; // ✅ params Promise -> await
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.participant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("DELETE /api/piyade/participants/[id] failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
