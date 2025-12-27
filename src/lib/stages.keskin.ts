import type { Stage } from "./stages";

export const KESKIN_STAGES: Stage[] = [
  {
    id: "kuvvet-devamlilik",
    title: "Kuvvette Devamlılık Test",
    weight: 0.2,
    metric: "time",
  },
  {
    id: "kuvvet",
    title: "Kuvvet Test",
    weight: 0.2,
    metric: "time",
  },
  {
    id: "keskin-atis-1",
    title: "Keskin Atış Etap 1",
    weight: 0.2,
    metric: "time",
  },
  {
    id: "keskin-atis-2",
    title: "Keskin Atış Etap 2",
    weight: 0.2,
    metric: "time",
  },
  {
    id: "keskin-atis-3",
    title: "Keskin Atış Etap 3",
    weight: 0.2,
    metric: "time",
  },
];
