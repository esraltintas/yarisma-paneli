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

  function exportCsv() {
    if (!stage) return;

    const sep = ";";
    const headers = ["Sıra", "Katılımcı", `${stage.title} (sn)`];

    const escape = (v: unknown) => {
      const s = String(v ?? "");
      if (
        s.includes('"') ||
        s.includes("\n") ||
        s.includes("\r") ||
        s.includes(sep)
      ) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines: string[] = [];
    lines.push(headers.map(escape).join(sep));

    for (const r of rows) {
      // export’ta maskeli değil, gerçek isim (dashboard’daki gibi)
      const valueOut = String(r.value).replace(".", ",");
      lines.push([r.rank, r.participant.name, valueOut].map(escape).join(sep));
    }

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swat-${mode}-${stage.id}-ranking-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!participants || !values) return <Loader />;

  if (!stage) {
    return <div style={{ color: "#6B7280" }}>Etap bulunamadı.</div>;
  }

  return (
    <div>
      {/* Header + Export */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 22 }}>{stage.title}</div>

        <button onClick={exportCsv} style={exportBtn}>
          Excel’e Aktar (CSV)
        </button>
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

/* --- styles --- */
const exportBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
