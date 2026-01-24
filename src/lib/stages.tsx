export type Stage = {
  id: string;
  title: string;
  weight: number;
  metric: "time";
};

export const STAGES: Stage[] = [
  {
    id: "atis",
    title: "Eforlu Atış",
    weight: 0.4,
    metric: "time",
  },
  {
    id: "anaerobik",
    title: "Kuvvette Devamlılık",
    weight: 0.3,
    metric: "time",
  },
  { id: "kuvvet", title: "Kuvvet", weight: 0.3, metric: "time" },
];
