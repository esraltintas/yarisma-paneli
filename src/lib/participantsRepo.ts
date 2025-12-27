// src/lib/participantsRepo.ts
import type { Mode } from "@/lib/getStagesByMode";

export type Participant = {
  id: string;
  name: string;
};

const VERSION = 1;
const keyParticipants = (mode: Mode) => `swat.${mode}.participants.v${VERSION}`;

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

function newId() {
  // deterministic değil ama local için yeterli
  return `p_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export const participantsRepo = {
  async list(mode: Mode): Promise<Participant[]> {
    const key = keyParticipants(mode);
    return safeLoad<Participant[]>(key, []);
  },

  async add(name: string, mode: Mode): Promise<Participant> {
    const key = keyParticipants(mode);
    const list = safeLoad<Participant[]>(key, []);

    const p: Participant = { id: newId(), name };
    list.push(p);

    safeSave(key, list);
    return p;
  },

  async updateName(id: string, name: string, mode: Mode): Promise<void> {
    const key = keyParticipants(mode);
    const list = safeLoad<Participant[]>(key, []);

    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], name };
      safeSave(key, list);
    }
  },

  async remove(id: string, mode: Mode): Promise<void> {
    const key = keyParticipants(mode);
    const list = safeLoad<Participant[]>(key, []);
    safeSave(
      key,
      list.filter((x) => x.id !== id)
    );
  },

  async clear(mode: Mode): Promise<void> {
    const key = keyParticipants(mode);
    safeSave(key, []);
  },
};
