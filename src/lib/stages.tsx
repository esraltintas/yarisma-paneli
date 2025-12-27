export type Stage = {
  id: string;
  title: string;
  weight: number;
  metric: "time";
};

export const STAGES: Stage[] = [
  {
    id: "atis",
    title: "Piyade Eforlu Atış Parkuru",
    weight: 0.4,
    metric: "time",
  },
  {
    id: "anaerobik",
    title: "Kuvvette Devamlılık Test",
    weight: 0.3,
    metric: "time",
  },
  { id: "kuvvet", title: "Kuvvet Test", weight: 0.3, metric: "time" },
];
