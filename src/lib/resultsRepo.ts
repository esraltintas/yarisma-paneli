// src/lib/resultsRepo.ts
export type Mode = "piyade"; // şimdilik

export type StageValue = {
  participantId: string;
  stageId: string;
  value: number | null; // saniye
};

async function readJsonOrThrow(res: Response, errMsg: string) {
  if (res.ok) return res.json();

  // Hata detayını almaya çalış (varsa)
  let detail = "";
  try {
    const data = await res.json();
    detail = data?.error ? ` (${data.error})` : "";
  } catch {
    // ignore
  }

  throw new Error(`${errMsg} [${res.status}]${detail}`);
}

export const resultsRepo = {
  async list(mode: Mode): Promise<StageValue[]> {
    const qs = new URLSearchParams({ mode });
    const res = await fetch(`/api/piyade/results?${qs.toString()}`, {
      cache: "no-store",
    });
    return (await readJsonOrThrow(res, "results list failed")) as StageValue[];
  },

  async setValue(
    mode: Mode,
    participantId: string,
    stageId: string,
    value: number | null,
  ): Promise<void> {
    const res = await fetch("/api/piyade/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ mode, participantId, stageId, value }),
    });

    if (!res.ok) {
      await readJsonOrThrow(res, "results setValue failed");
    }
  },

  async removeParticipant(mode: Mode, participantId: string): Promise<void> {
    const qs = new URLSearchParams({ mode, participantId });
    const res = await fetch(`/api/piyade/results?${qs.toString()}`, {
      method: "DELETE",
      cache: "no-store",
    });

    if (!res.ok) {
      await readJsonOrThrow(res, "results removeParticipant failed");
    }
  },
};
