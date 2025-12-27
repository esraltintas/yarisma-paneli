// src/lib/resultsRepo.ts
import type { Mode } from "@/lib/getStagesByMode";

export type StageValue = {
  participantId: string;
  stageId: string;
  value: number | null; // dakika, null => sil/boş
};

const VERSION = 1;
const keyResults = (mode: Mode) => `swat.${mode}.results.v${VERSION}`;

function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSave<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const resultsRepo = {
  async list(mode: Mode): Promise<StageValue[]> {
    const key = keyResults(mode);
    return safeLoad<StageValue[]>(key, []);
  },

  /**
   * value null ise: kaydı siler (temiz davranış)
   */
  async upsert(input: {
    mode: Mode;
    participantId: string;
    stageId: string;
    value: number | null;
  }): Promise<void> {
    const { mode, participantId, stageId, value } = input;

    const key = keyResults(mode);
    const list = safeLoad<StageValue[]>(key, []);

    const next = list.filter(
      (x) => !(x.participantId === participantId && x.stageId === stageId)
    );

    if (value !== null) {
      next.push({ participantId, stageId, value });
    }

    safeSave(key, next);
  },

  async remove(
    mode: Mode,
    participantId: string,
    stageId: string
  ): Promise<void> {
    const key = keyResults(mode);
    const list = safeLoad<StageValue[]>(key, []);
    safeSave(
      key,
      list.filter(
        (x) => !(x.participantId === participantId && x.stageId === stageId)
      )
    );
  },

  async removeByParticipant(mode: Mode, participantId: string): Promise<void> {
    const key = keyResults(mode);
    const list = safeLoad<StageValue[]>(key, []);
    safeSave(
      key,
      list.filter((x) => x.participantId !== participantId)
    );
  },

  async clear(mode: Mode): Promise<void> {
    const key = keyResults(mode);
    safeSave(key, []);
  },
};

// (opsiyonel debug)
// window.resultsRepo = resultsRepo;
