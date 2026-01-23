"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { stagePointsByRank } from "@/lib/scoring";
import { getStagesByMode, type Mode } from "@/lib/getStagesByMode";
import { formatTime } from "@/lib/format";
import { maskName } from "@/lib/maskName";

type Row = {
  participant: Participant;
  value: number | null;
  rank: number | null;
  points: number | null;
};

export default function StageRankingClient({
  mode,
  stageId,
}: {
  mode: Mode;
  stageId: string;
}) {
  // ✅ HOOKS her zaman en üstte
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);

  // stage resolve (hook değil)
  const stages = getStagesByMode(mode);
  const stage = stages.find((s) => s.id === stageId) ?? null;

  // load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, v] = await Promise.all([
        participantsRepo.list(mode),
        resultsRepo.list(mode),
      ]);
      if (cancelled) return;
      setParticipants(p);
      setValues(v);
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const valueMap = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const v of values) {
      m.set(`${v.participantId}:${v.stageId}`, v.value ?? null);
    }
    return m;
  }, [values]);

  const rows: Row[] = useMemo(() => {
    if (!stage) return []; // stage yoksa boş dön (render kısmında notFound yapacağız)

    const present = participants
      .map((p) => ({
        participant: p,
        value: valueMap.get(`${p.id}:${stage.id}`) ?? null,
      }))
      .filter((x) => x.value != null) as {
      participant: Participant;
      value: number;
    }[];

    present.sort((a, b) => {
      const c = a.value - b.value; // time: küçük iyi
      if (c !== 0) return c;
      return a.participant.name.localeCompare(b.participant.name, "tr");
    });

    const ranked: Row[] = [];
    let currentRank = 1;
    let i = 0;

    while (i < present.length) {
      const baseVal = present[i].value;
      let j = i;
      while (j < present.length && present[j].value === baseVal) j++;

      const groupSize = j - i;
      const pts = stagePointsByRank(currentRank);

      for (let k = i; k < j; k++) {
        ranked.push({
          participant: present[k].participant,
          value: present[k].value,
          rank: currentRank,
          points: pts,
        });
      }

      currentRank += groupSize; // ✅ rank atlama
      i = j;
    }

    const missing: Row[] = participants
      .filter((p) => !valueMap.has(`${p.id}:${stage.id}`))
      .map((p) => ({
        participant: p,
        value: null,
        rank: null,
        points: null,
      }));

    return [...ranked, ...missing];
  }, [participants, valueMap, stage]);

  // ✅ Guard HOOK'lardan sonra (artık conditional hook yok)
  if (!stage) {
    notFound();
  }

  function exportCsv() {
    const sep = ";";
    const headers = ["Sıra", "Katılımcı", "Süre (dk)", "Puan"];

    const escape = (v: unknown) => {
      const s = String(v ?? "");
      if (s.includes('"') || s.includes("\n") || s.includes(sep)) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines: string[] = [];
    lines.push(headers.map(escape).join(sep));

    for (const r of rows) {
      const valueOut = r.value == null ? "" : String(r.value).replace(".", ",");
      lines.push(
        [r.rank ?? "", r.participant.name, valueOut, r.points ?? ""]
          .map(escape)
          .join(sep),
      );
    }

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `swat-${mode}-${stageId}-ranking.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={header}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          {stage.title} Sıralaması
        </h1>

        <button onClick={exportCsv} style={exportBtn}>
          Excel’e Aktar
        </button>
      </div>

      <div style={wrap}>
        <table style={{ width: "100%", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={th}>Sıra</th>
              <th style={th}>Katılımcı</th>
              <th style={th}>Süre</th>
              <th style={th}>Puan</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.participant.id}>
                <td style={td}>{r.rank ?? "—"}</td>
                <td style={td}>{maskName(r.participant.name)}</td>
                <td style={td}>
                  {r.value == null ? "—" : formatTime(r.value)}
                </td>
                <td style={td}>{r.points ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* styles */
const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const wrap: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  overflowX: "auto",
  background: "white",
};

const th: React.CSSProperties = {
  padding: 12,
  background: "#F9FAFB",
  borderBottom: "1px solid #E5E7EB",
  textAlign: "left",
};

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #F3F4F6",
};

const exportBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
