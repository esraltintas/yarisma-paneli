// src/lib/resultsRepo.ts
export type StageValue = {
  participantId: string;
  stageId: string;
  value: number | null; // saniye
};

type Mode = "piyade";

export const resultsRepo = {
  async list(mode: Mode): Promise<StageValue[]> {
    const res = await fetch(`/api/${mode}/results`, { cache: "no-store" });
    if (!res.ok) throw new Error("results list failed");
    return (await res.json()) as StageValue[];
  },

  // ✅ Route.ts POST bekliyor (PUT/PATCH değil)
  async setValue(
    mode: Mode,
    participantId: string,
    stageId: string,
    value: number | null,
  ): Promise<void> {
    const res = await fetch(`/api/${mode}/results`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ participantId, stageId, value }),
    });

    if (!res.ok) throw new Error("results setValue failed");
  },

  // ✅ Route.ts DELETE ?participantId=... bekliyor
  async removeParticipant(mode: Mode, participantId: string): Promise<void> {
    const url = `/api/${mode}/results?participantId=${encodeURIComponent(
      participantId,
    )}`;

    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) throw new Error("results removeParticipant failed");
  },
};
