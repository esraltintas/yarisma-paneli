export type Stage = {
  id: string;
  title: string;
  weight: number; // yüzde
};

export const STAGES: Stage[] = [
  { id: "atis", title: "Atış", weight: 0.35 },
  { id: "anaerobik", title: "Anaerobik", weight: 0.25 },
  { id: "aerobik", title: "Aerobik", weight: 0.2 },
  { id: "kuvvet", title: "Kuvvet", weight: 0.2 },
];
