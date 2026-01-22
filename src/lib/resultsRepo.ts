export type StageValue = {
  participantId: string;
  stageId: string;
  value: number | null; // saniye
};

export const resultsRepo = {
  async list() {
    const res = await fetch("/api/piyade/results", { cache: "no-store" });
    if (!res.ok) throw new Error("results list failed");
    return (await res.json()) as StageValue[];
  },

  async upsert(v: StageValue) {
    const res = await fetch("/api/piyade/results", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    if (!res.ok) throw new Error("results upsert failed");
    return (await res.json()) as StageValue;
  },
};
