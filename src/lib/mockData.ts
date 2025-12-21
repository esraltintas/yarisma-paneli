import type { Participant, StageResult } from "./types";

export const participants: Participant[] = [
  { id: "p1", name: "Efehan" },
  { id: "p2", name: "Esra" },
  { id: "p3", name: "Gulay" },
  { id: "p4", name: "Ferdi" },
  { id: "p5", name: "Selo" },
  { id: "p6", name: "Kaan" },
  { id: "p7", name: "Mehmet" },
  { id: "p8", name: "Halil" },
];

export const results: StageResult[] = [
  { participantId: "p1", stageId: "atis", timeSec: 5 },
  { participantId: "p1", stageId: "anaerobik", timeSec: 180 },
  { participantId: "p1", stageId: "aerobik", timeSec: 420 },
  { participantId: "p1", stageId: "kuvvet", timeSec: 95 },

  { participantId: "p2", stageId: "atis", timeSec: 5 },
  { participantId: "p2", stageId: "anaerobik", timeSec: 10 },
  { participantId: "p2", stageId: "aerobik", timeSec: 40 },
  { participantId: "p2", stageId: "kuvvet", timeSec: 90 },

  { participantId: "p3", stageId: "atis", timeSec: 5 },
  { participantId: "p3", stageId: "anaerobik", timeSec: 200 },
  { participantId: "p3", stageId: "aerobik", timeSec: 10 },
  { participantId: "p3", stageId: "kuvvet", timeSec: 200 },

  { participantId: "p4", stageId: "atis", timeSec: 1 },
  { participantId: "p4", stageId: "kuvvet", timeSec: 200 },
  { participantId: "p4", stageId: "aerobik", timeSec: 420 },
  { participantId: "p4", stageId: "anaerobik", timeSec: 95 },

  { participantId: "p5", stageId: "atis", timeSec: 55 },
  { participantId: "p5", stageId: "anaerobik", timeSec: 180 },
  { participantId: "p5", stageId: "aerobik", timeSec: 420 },
  { participantId: "p5", stageId: "kuvvet", timeSec: 95 },

  { participantId: "p6", stageId: "atis", timeSec: 60 },
  { participantId: "p6", stageId: "anaerobik", timeSec: 170 },
  { participantId: "p6", stageId: "aerobik", timeSec: 460 },
  { participantId: "p6", stageId: "kuvvet", timeSec: 90 },

  { participantId: "p7", stageId: "atis", timeSec: null },
  { participantId: "p7", stageId: "anaerobik", timeSec: 200 },
  { participantId: "p7", stageId: "aerobik", timeSec: 10 },
  { participantId: "p7", stageId: "kuvvet", timeSec: 200 },

  { participantId: "p8", stageId: "atis", timeSec: 10 },
  { participantId: "p8", stageId: "kuvvet", timeSec: 200 },
  { participantId: "p8", stageId: "aerobik", timeSec: 420 },
  { participantId: "p8", stageId: "anaerobik", timeSec: 95 },
];
