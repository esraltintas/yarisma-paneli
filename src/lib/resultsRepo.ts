export type ParticipantId = string;
export type StageId = string;

export type StageValue = {
  participantId: ParticipantId;
  stageId: StageId;
  value: number | null; // time => dk, count => adet
};

export type ResultsRepo = {
  list(): Promise<StageValue[]>;
  upsert(v: StageValue): Promise<void>;
  removeParticipant(participantId: ParticipantId): Promise<void>;
};

const KEY = "swat.stageValues.v1";

function safeLoad(): StageValue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (x) =>
          x &&
          typeof x.participantId === "string" &&
          typeof x.stageId === "string" &&
          (typeof x.value === "number" || x.value === null)
      )
      .map((x) => ({
        participantId: x.participantId,
        stageId: x.stageId,
        value: x.value === null ? null : Number(x.value),
      }));
  } catch {
    return [];
  }
}

function save(list: StageValue[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export const resultsRepo: ResultsRepo = {
  async list() {
    return safeLoad();
  },

  async upsert(v) {
    const list = safeLoad();
    const next = list.filter(
      (x) => !(x.participantId === v.participantId && x.stageId === v.stageId)
    );

    // null ise "sil" gibi davranalım (istersen tutabiliriz)
    if (v.value === null) {
      save(next);
      return;
    }

    save([...next, v]);
  },

  async removeParticipant(participantId) {
    const list = safeLoad();
    save(list.filter((x) => x.participantId !== participantId));
  },
};
