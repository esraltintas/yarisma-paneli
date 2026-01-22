// src/lib/resultsRepo.ts
export type Mode = "piyade" | "keskin";

export type StageValue = {
  participantId: string;
  stageId: string;
  value: number | null;
};

function apiBase(mode: Mode) {
  return `/api/${mode}`;
}

export const resultsRepo = {
  async list(mode: Mode): Promise<StageValue[]> {
    const res = await fetch(`${apiBase(mode)}/results`, { cache: "no-store" });
    if (!res.ok) throw new Error("results list failed");
    return (await res.json()) as StageValue[];
  },

  /**
   * tek hücre upsert (participantId + stageId)
   */
  async setValue(
    mode: Mode,
    participantId: string,
    stageId: string,
    value: number | null,
  ): Promise<void> {
    const res = await fetch(`${apiBase(mode)}/results`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ participantId, stageId, value }),
    });

    if (!res.ok) throw new Error("results setValue failed");
  },

  /**
   * katılımcı silinince onun tüm sonuçlarını da sil
   * (Client tarafındaki runtime hatanın sebebi buydu: bu fonksiyon yoktu.)
   */
  async removeParticipant(mode: Mode, participantId: string): Promise<void> {
    const res = await fetch(
      `${apiBase(mode)}/results/participant/${participantId}`,
      {
        method: "DELETE",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("results removeParticipant failed");
  },
};
