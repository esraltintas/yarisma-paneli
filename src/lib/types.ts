export type Participant = {
  id: string;
  name: string;
};

export type StageResult = {
  participantId: string;
  stageId: string; // "atis" | "anaerobik" | ...
  timeSec: number | null; // süre yoksa null
};
