import { STAGES } from "./stages";
import { stagePointsByRank } from "./scoring";
import type { Participant, StageResult } from "./types";

import { competitionRanksByTime } from "@/lib/ranking";

export type StageCellInfo = {
  timeSec: number | null;
  rank: number | null; // o etapta kaçıncı
  points: number | null; // base etap puanı (100/95/...)
  weighted: number | null; // ağırlıklı katkı (points * weight)
};

export function calculateStageBreakdown(
  participants: Participant[],
  results: StageResult[]
) {
  const timeMap = new Map<string, number>();
  results.forEach((r) => {
    if (r.timeSec != null)
      timeMap.set(`${r.participantId}:${r.stageId}`, r.timeSec);
  });

  const cellMap = new Map<string, StageCellInfo>();

  // default: boş
  for (const p of participants) {
    for (const s of STAGES) {
      const t = timeMap.get(`${p.id}:${s.id}`);
      cellMap.set(`${p.id}:${s.id}`, {
        timeSec: t ?? null,
        rank: null,
        points: null,
        weighted: null,
      });
    }
  }

  // her etap için sırala -> rank -> puan
  for (const stage of STAGES) {
    const ranked = participants
      .map((p) => ({
        participantId: p.id,
        time: timeMap.get(`${p.id}:${stage.id}`),
      }))
      .filter((x) => x.time != null)
      .sort((a, b) => a.time! - b.time!);

    const ranks = competitionRanksByTime(ranked, (r) => r.time!);

    ranked.forEach((r, idx) => {
      const rank = ranks[idx]; // 4,4,4,4,4,9 ✔
      const points = stagePointsByRank(rank);
      const weighted = points * stage.weight;

      cellMap.set(`${r.participantId}:${stage.id}`, {
        timeSec: r.time!,
        rank,
        points,
        weighted,
      });
    });
  }

  return cellMap;
}
