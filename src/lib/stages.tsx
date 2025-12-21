export type Stage = {
  id: string;
  title: string;
  weight: number; // yüzde
};

export const STAGES: Stage[] = [
  { id: "atis", title: "Atış", weight: 0.55 },
  { id: "anaerobik", title: "Anaerobik", weight: 0.18 },
  { id: "aerobik", title: "Aerobik", weight: 0.135 },
  { id: "kuvvet", title: "Kuvvet", weight: 0.135 },
];
