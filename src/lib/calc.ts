import { STAGES } from "./stages";
import { stagePointsByRank } from "./scoring";
import type { Participant, StageResult } from "./types";

export function calculateOverall(
  participants: Participant[],
  results: StageResult[]
) {
  // Map: participantId -> stageId -> time
  const timeMap = new Map<string, number>();

  results.forEach((r) => {
    if (r.timeMin != null) {
      timeMap.set(`${r.participantId}:${r.stageId}`, r.timeMin);
    }
  });

  // participantId -> total weighted score
  const totals = new Map<string, number>();

  participants.forEach((p) => totals.set(p.id, 0));

  STAGES.forEach((stage) => {
    // Bu etapta süre girenleri sırala
    const ranked = participants
      .map((p) => ({
        participantId: p.id,
        time: timeMap.get(`${p.id}:${stage.id}`),
      }))
      .filter((r) => r.time != null)
      .sort((a, b) => a.time! - b.time!);

    ranked.forEach((r, index) => {
      const rank = index + 1;
      const basePoint = stagePointsByRank(rank);
      const weightedPoint = basePoint * stage.weight;

      totals.set(
        r.participantId,
        (totals.get(r.participantId) ?? 0) + weightedPoint
      );
    });
  });

  return totals;
}
