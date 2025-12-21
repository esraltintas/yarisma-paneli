export type Participant = {
  id: string;
  name: string;
};

export type StageResult = {
  participantId: string;
  stageId: string;
  timeMin?: number | null; // ⬅️ dakika (ondalıklı)
  count?: number | null; // kuvvet
};
