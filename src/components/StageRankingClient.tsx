"use client";

import { useEffect, useMemo, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { getStagesByMode, type Mode } from "@/lib/getStagesByMode";
import { maskName } from "@/lib/maskName";
import { formatTime } from "@/lib/format";
import Loader from "@/components/Loader";

type ParticipantRow = Participant & { createdAt?: string | Date };

export default function StageRankingClient({
  mode,
  stageId,
}: {
  mode: Mode;
  stageId: string;
}) {
  const STAGES = getStagesByMode(mode);
  const stage = STAGES.find((s) => s.id === stageId);

  const [participants, setParticipants] = useState<ParticipantRow[] | null>(
    null,
  );
  const [values, setValues] = useState<StageValue[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [p, v] = await Promise.all([
        participantsRepo.list(mode),
        resultsRepo.list(mode),
      ]);
      if (cancelled) return;
      setParticipants(p as ParticipantRow[]);
      setValues(v);
    })();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const rows = useMemo(() => {
    if (!participants || !values || !stage) return [];

    const map = new Map<string, number>();
    for (const x of values) {
      if (x.stageId !== stageId) continue;
      if (x.value == null) continue;
      map.set(x.participantId, x.value);
    }

    const present = participants
      .map((p) => ({
        participant: p,
        value: map.get(p.id) ?? null,
      }))
      .filter((x) => x.value != null) as {
      participant: ParticipantRow;
      value: number;
    }[];

    present.sort((a, b) => {
      const c = a.value - b.value;
      if (c !== 0) return c;
      return a.participant.id.localeCompare(b.participant.id);
    });

    return present.map((x, idx) => ({
      rank: idx + 1,
      participant: x.participant,
      value: x.value,
    }));
  }, [participants, values, stageId, stage]);

  if (!participants || !values) return <Loader />;

  if (!stage) {
    return <div style={{ color: "#6B7280" }}>Etap bulunamadı.</div>;
  }

  return (
    <div>
      <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 14 }}>
        {stage.title}
      </div>

      {rows.length === 0 ? (
        <div style={{ color: "#6B7280" }}>
          Bu etap için henüz değer girilmemiş.
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {rows.map((r) => (
            <div
              key={r.participant.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid #F3F4F6",
                background: "white",
              }}
            >
              <div style={{ fontWeight: 900 }}>
                {r.rank}. {maskName(r.participant.name)}
              </div>
              <div style={{ fontWeight: 900, color: "#111827" }}>
                {formatTime(r.value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
