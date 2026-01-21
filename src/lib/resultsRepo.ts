// src/lib/resultsRepo.ts
export type Mode = "piyade" | "keskin";

export type StageValue = {
  participantId: string;
  stageId: string;
  value: number | null; // ✅ saniye (sn)
};

const STORAGE_PREFIX = "swat_results_v1";

function storageKey(mode: Mode) {
  return `${STORAGE_PREFIX}:${mode}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function clampNonNegative(v: number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (Number.isNaN(v)) return null;
  // ✅ eksi engeli (repo-level)
  return Math.max(0, v);
}

function normalizeNumberInput(raw: unknown): number | null {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (Number.isNaN(n)) return null;
  return clampNonNegative(n);
}

export const resultsRepo = {
  async list(mode: Mode): Promise<StageValue[]> {
    if (typeof window === "undefined") return [];
    return safeParse<StageValue[]>(
      window.localStorage.getItem(storageKey(mode)),
      [],
    );
  },

  async set(
    mode: Mode,
    participantId: string,
    stageId: string,
    value: number | string | null | undefined,
  ): Promise<void> {
    if (typeof window === "undefined") return;

    const v = normalizeNumberInput(value);

    const items = safeParse<StageValue[]>(
      window.localStorage.getItem(storageKey(mode)),
      [],
    );

    const idx = items.findIndex(
      (x) => x.participantId === participantId && x.stageId === stageId,
    );

    if (v === null) {
      // boşsa kaydı kaldır (girilmeyen etap gibi dursun)
      if (idx >= 0) items.splice(idx, 1);
    } else {
      if (idx >= 0) items[idx] = { participantId, stageId, value: v };
      else items.push({ participantId, stageId, value: v });
    }

    window.localStorage.setItem(storageKey(mode), JSON.stringify(items));
  },

  async removeParticipant(mode: Mode, participantId: string): Promise<void> {
    if (typeof window === "undefined") return;

    const items = safeParse<StageValue[]>(
      window.localStorage.getItem(storageKey(mode)),
      [],
    );

    const filtered = items.filter((x) => x.participantId !== participantId);
    window.localStorage.setItem(storageKey(mode), JSON.stringify(filtered));
  },

  async clear(mode: Mode): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey(mode));
  },
};
