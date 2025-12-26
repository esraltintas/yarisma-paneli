import { resultsRepo } from "@/lib/resultsRepo";

export type Participant = {
  id: string;
  name: string;
};

export type ParticipantsRepo = {
  list(): Promise<Participant[]>;
  add(name: string): Promise<Participant>;
  remove(id: string): Promise<void>;
};

const KEY = "swat.participants.v1";

/* ---------- private helpers (EXPORT EDİLMEZ) ---------- */

function safeLoad(): Participant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (x) => x && typeof x.id === "string" && typeof x.name === "string"
      )
      .map((x) => ({
        id: x.id,
        name: x.name.trim(),
      }))
      .filter((x) => x.name.length > 0);
  } catch {
    return [];
  }
}

function save(list: Participant[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

function newId() {
  return "p_" + Math.random().toString(36).slice(2, 10);
}

/* ---------------- public repo ---------------- */

export const participantsRepo: ParticipantsRepo = {
  async list() {
    return safeLoad();
  },

  async add(name: string) {
    const n = name.trim();
    if (!n) throw new Error("İsim boş olamaz.");

    const list = safeLoad();
    const exists = list.some((p) => p.name.toLowerCase() === n.toLowerCase());
    if (exists) throw new Error("Bu isim zaten ekli.");

    const participant: Participant = { id: newId(), name: n };
    const next = [participant, ...list];
    save(next);
    return participant;
  },

  async remove(id: string) {
    const list = safeLoad();
    save(list.filter((p) => p.id !== id));

    // 👇 kişinin tüm etap sonuçlarını da temizle
    await resultsRepo.removeParticipant(id);
  },
};
