export type Stage = {
  id: string;
  title: string;
  order?: number;
  active?: boolean;
};

export const STAGES: Stage[] = [
  { id: "atis", title: "Atış" },
  { id: "anaerobik", title: "Anaerobik" },
  { id: "aerobik", title: "Aerobik" },
  { id: "kuvvet", title: "Kuvvet" },
];
