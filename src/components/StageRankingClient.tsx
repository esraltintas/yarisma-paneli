"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { STAGES } from "@/lib/stages";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { stagePointsByRank } from "@/lib/scoring"; // sende neredeyse orası
import { formatTime } from "@/lib/format";

type Row = {
  participant: Participant;
  value: number | null;
  rank: number | null;
  points: number | null;
};

export default function StageRankingClient({ stageId }: { stageId: string }) {
  const router = useRouter();

  const stage = STAGES.find((s) => s.id === stageId);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, v] = await Promise.all([
        participantsRepo.list(),
        resultsRepo.list(),
      ]);
      if (cancelled) return;
      setParticipants(p);
      setValues(v);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // stage yoksa dashboard’a dön (notFound yerine client’ta en temiz yol)
  useEffect(() => {
    if (!stage) router.replace("/dashboard");
  }, [stage, router]);

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of values) {
      if (x.value == null) continue;
      m.set(`${x.participantId}:${x.stageId}`, x.value);
    }
    return m;
  }, [values]);

  const rows: Row[] = useMemo(() => {
    if (!stage) return [];

    // value’lu olanları sırala (time asc, count desc)
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
      const c = stage.metric === "time" ? a.value - b.value : b.value - a.value;
      if (c !== 0) return c;
      return a.participant.id.localeCompare(b.participant.id);
    });

    // tie rank (4,4,4,9) + puan
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

      currentRank += groupSize;
      i = j;
    }

    // value’su olmayanları en alta ekle
    const missing = participants
      .filter((p) => !valueMap.has(`${p.id}:${stage.id}`))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      .map<Row>((p) => ({
        participant: p,
        value: null,
        rank: null,
        points: null,
      }));

    return [...ranked, ...missing];
  }, [participants, valueMap, stage]);

  if (!stage) return null;

  function exportStageCsv() {
    if (!stage) return;

    const sep = ";";

    const headers = ["Etap", "Sıra", "Katılımcı", "Süre (dk)", "Puan"];

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
      const valueOut =
        r.value == null
          ? ""
          : stage.metric === "time"
          ? String(r.value).replace(".", ",")
          : String(r.value);

      lines.push(
        [
          stage.title,
          r.rank ?? "",
          r.participant.name,
          valueOut,
          r.points ?? "",
        ]
          .map(escape)
          .join(sep)
      );
    }

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const fileName = `swat-${stage.id}-siralama-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          {stage.title} Sıralaması
        </h1>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12,
          }}
        >
          <button onClick={exportStageCsv} style={exportBtn}>
            Excel’e Aktar (CSV)
          </button>
        </div>
        <div style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
          Ağırlık: <b>%{formatWeight(stage.weight)}</b> • Ölçüm:{" "}
          <b>Süre (dk)</b>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          background: "white",
          color: "#111827",
        }}
      >
        <table style={{ width: "100%", minWidth: 720 }}>
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
                <td style={td}>{r.participant.name}</td>
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

function formatWeight(w: number) {
  const pct = w * 100;
  return Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(1).replace(/\.0$/, "");
}

const th: React.CSSProperties = {
  padding: 12,
  textAlign: "left",
  background: "#F9FAFB",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #F3F4F6",
  whiteSpace: "nowrap",
};

const exportBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
