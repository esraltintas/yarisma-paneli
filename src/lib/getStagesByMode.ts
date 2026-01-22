import { STAGES } from "./stages";
import { KESKIN_STAGES } from "./stages.keskin";
import type { Stage } from "./stages";

export type Mode = "piyade";

export function getStagesByMode(mode: Mode): Stage[] {
  return mode === "piyade" ? STAGES : KESKIN_STAGES;
}
