import { STAGES } from "./stages";
import { stagePointsByRank } from "./scoring";
import type { Participant, StageResult } from "./types";
import { competitionRanksByTime } from "@/lib/ranking";

export type StageCellInfo = {
  value: number | null; // timeSec veya count
  metric: "time" | "count";
  rank: number | null;
  points: number | null;
  weighted: number | null;
};

export function calculateStageBreakdown(
  participants: Participant[],
  results: StageResult[]
) {
  const cellMap = new Map<string, StageCellInfo>();

  // default: boş
  for (const p of participants) {
    for (const s of STAGES) {
      cellMap.set(`${p.id}:${s.id}`, {
        value: null,
        metric: s.metric,
        rank: null,
        points: null,
        weighted: null,
      });
    }
  }

  // her etap için sırala -> rank -> puan
  for (const stage of STAGES) {
    const ranked = participants
      .map((p) => {
        const r = results.find(
          (x) => x.participantId === p.id && x.stageId === stage.id
        );

        const value =
          stage.metric === "time" ? r?.timeMin ?? null : r?.count ?? null;
        return { participantId: p.id, value };
      })
      .filter(
        (x): x is { participantId: string; value: number } => x.value != null
      )
      .sort((a, b) => {
        // time: küçük daha iyi, count: büyük daha iyi
        return stage.metric === "time" ? a.value - b.value : b.value - a.value;
      });

    // ✅ competition ranking (tie varsa aynı rank, sonra atlayarak)
    const ranks = competitionRanksByTime(ranked, (r) => r.value);

    ranked.forEach((r, idx) => {
      const rank = ranks[idx];
      const points = stagePointsByRank(rank);
      const weighted = points * stage.weight;

      cellMap.set(`${r.participantId}:${stage.id}`, {
        value: r.value,
        metric: stage.metric,
        rank,
        points,
        weighted,
      });
    });
  }

  return cellMap;
}
