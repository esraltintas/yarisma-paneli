import type { Participant, StageResult } from "./types";

export const participants: Participant[] = [
  { id: "p1", name: "Ahmet Saglam" },
  { id: "p2", name: "Mehmet Tasci" },
  { id: "p3", name: "Hasan Kirik" },
  { id: "p4", name: "Huseyin Kaya" },
  { id: "p5", name: "Kaan Yavuz" },
  { id: "p6", name: "Ferdi Tan" },
  { id: "p7", name: "Mehmet Ali Yilmaz" },
  { id: "p8", name: "Halil Semaver" },
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

  { participantId: "p4", stageId: "atis", timeSec: 5 },
  { participantId: "p4", stageId: "kuvvet", timeSec: 200 },
  { participantId: "p4", stageId: "aerobik", timeSec: 420 },
  { participantId: "p4", stageId: "anaerobik", timeSec: 95 },

  { participantId: "p5", stageId: "atis", timeSec: 5 },
  { participantId: "p5", stageId: "anaerobik", timeSec: 180 },
  { participantId: "p5", stageId: "aerobik", timeSec: 420 },
  { participantId: "p5", stageId: "kuvvet", timeSec: 95 },

  { participantId: "p6", stageId: "atis", timeSec: 6 },
  { participantId: "p6", stageId: "anaerobik", timeSec: 170 },
  { participantId: "p6", stageId: "aerobik", timeSec: 460 },
  { participantId: "p6", stageId: "kuvvet", timeSec: 90 },

  { participantId: "p7", stageId: "atis", timeSec: 7 },
  { participantId: "p7", stageId: "anaerobik", timeSec: 200 },
  { participantId: "p7", stageId: "aerobik", timeSec: 10 },
  { participantId: "p7", stageId: "kuvvet", timeSec: 200 },

  { participantId: "p8", stageId: "atis", timeSec: 8 },
  { participantId: "p8", stageId: "kuvvet", timeSec: 200 },
  { participantId: "p8", stageId: "aerobik", timeSec: 420 },
  { participantId: "p8", stageId: "anaerobik", timeSec: 95 },
];
