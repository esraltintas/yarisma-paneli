import type { Participant, StageResult } from "./types";

export const participants: Participant[] = [
  { id: "p1", name: "Ahmet Saglam" },
  { id: "p2", name: "Mehmet Tasci" },
  { id: "p3", name: "Hasan Kirik" },
  { id: "p4", name: "Huseyin Kaya" },
  { id: "p5", name: "Kaan Yavuz" },
  { id: "p6", name: "Ferdi Ata" },
  { id: "p7", name: "Efehan Alpagu" },
  { id: "p8", name: "Halil Kuma" },
];

export const results: StageResult[] = [
  { participantId: "p1", stageId: "atis", timeMin: 1.3 }, // 1.3 sn
  { participantId: "p1", stageId: "anaerobik", timeMin: 3.0 },
  { participantId: "p1", stageId: "aerobik", timeMin: 7.0 },
  { participantId: "p1", stageId: "kuvvet", count: 42 },

  { participantId: "p2", stageId: "atis", timeMin: 10 }, // 5 sn
  { participantId: "p2", stageId: "anaerobik", timeMin: 0.17 },
  { participantId: "p2", stageId: "aerobik", timeMin: 0.67 },
  { participantId: "p2", stageId: "kuvvet", count: 50 },

  { participantId: "p3", stageId: "atis", timeMin: 0.08 },
  { participantId: "p3", stageId: "anaerobik", timeMin: 3.33 },
  { participantId: "p3", stageId: "aerobik", timeMin: 0.17 },
  { participantId: "p3", stageId: "kuvvet", count: 38 },

  { participantId: "p4", stageId: "atis", timeMin: 0.08 },
  { participantId: "p4", stageId: "anaerobik", timeMin: 1.58 },
  { participantId: "p4", stageId: "aerobik", timeMin: 7.0 },
  { participantId: "p4", stageId: "kuvvet", count: 45 },

  { participantId: "p5", stageId: "atis", timeMin: 0.08 },
  { participantId: "p5", stageId: "anaerobik", timeMin: 3.0 },
  { participantId: "p5", stageId: "aerobik", timeMin: 7.0 },
  { participantId: "p5", stageId: "kuvvet", count: 42 },

  { participantId: "p6", stageId: "atis", timeMin: 0.1 },
  { participantId: "p6", stageId: "anaerobik", timeMin: 2.83 },
  { participantId: "p6", stageId: "aerobik", timeMin: 7.67 },
  { participantId: "p6", stageId: "kuvvet", count: 50 },

  { participantId: "p7", stageId: "atis", timeMin: 0.12 },
  { participantId: "p7", stageId: "anaerobik", timeMin: 3.33 },
  { participantId: "p7", stageId: "aerobik", timeMin: 0.17 },
  { participantId: "p7", stageId: "kuvvet", count: 38 },

  { participantId: "p8", stageId: "atis", timeMin: 0.13 },
  { participantId: "p8", stageId: "anaerobik", timeMin: 1.58 },
  { participantId: "p8", stageId: "aerobik", timeMin: 7.0 },
  { participantId: "p8", stageId: "kuvvet", count: 45 },
];
