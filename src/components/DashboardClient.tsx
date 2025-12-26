"use client";

import { useEffect, useMemo, useState } from "react";
import { STAGES } from "@/lib/stages";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { stagePointsByRank } from "@/lib/scoring";
import { formatTime } from "@/lib/format";

type StageCell = {
  metric: "time" | "count";
  value: number | null;
  rank: number | null;
  points: number | null;
  weighted: number | null;
};

const RULE_TOOLTIP = `Puanlama (rank):
1–3: 100
4–7: 95
8–12: 90
13–20: 85
21–30: 80
31–40: 75
41–50: 70
51–60: 65
61–70: 60
71–80: 55
81–88: 50
89–94: 45
95–97: 35
98–99: 20
100: 0`;

export default function DashboardClient() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);

  // ✅ 1 kere yükle
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

  // quick lookup: participantId:stageId -> value
  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of values) {
      if (x.value == null) continue;
      m.set(`${x.participantId}:${x.stageId}`, x.value);
    }
    return m;
  }, [values]);

  // etap bazlı rank/puan hesapla (tie'lı, rank atlamalı)
  const stageRankMaps = useMemo(() => {
    const maps: Record<
      string,
      { rankByPid: Map<string, number>; pointsByPid: Map<string, number> }
    > = {};

    for (const stage of STAGES) {
      // sadece değeri olanlar rank'lanır
      const present = participants
        .map((p) => ({
          participantId: p.id,
          value: valueMap.get(`${p.id}:${stage.id}`) ?? null,
        }))
        .filter((x) => x.value != null) as {
        participantId: string;
        value: number;
      }[];

      present.sort((a, b) => {
        const c =
          stage.metric === "time"
            ? a.value - b.value // küçük daha iyi
            : b.value - a.value; // büyük daha iyi
        if (c !== 0) return c;
        return a.participantId.localeCompare(b.participantId);
      });

      const rankByPid = new Map<string, number>();
      const pointsByPid = new Map<string, number>();

      let currentRank = 1;
      let i = 0;

      while (i < present.length) {
        const baseVal = present[i].value;
        let j = i;
        while (j < present.length && present[j].value === baseVal) j++;

        const groupSize = j - i;
        const pts = stagePointsByRank(currentRank);

        for (let k = i; k < j; k++) {
          const pid = present[k].participantId;
          rankByPid.set(pid, currentRank);
          pointsByPid.set(pid, pts);
        }

        currentRank += groupSize; // ✅ rank atlama kuralı
        i = j;
      }

      maps[stage.id] = { rankByPid, pointsByPid };
    }

    return maps;
  }, [participants, valueMap]);

  // cellMap + overall
  const { cellMap, overallRows } = useMemo(() => {
    const cellMap = new Map<string, StageCell>();

    // default boş hücreler
    for (const p of participants) {
      for (const s of STAGES) {
        const v = valueMap.get(`${p.id}:${s.id}`) ?? null;
        cellMap.set(`${p.id}:${s.id}`, {
          metric: s.metric,
          value: v,
          rank: null,
          points: null,
          weighted: null,
        });
      }
    }

    // doldur
    for (const s of STAGES) {
      const { rankByPid, pointsByPid } = stageRankMaps[s.id] ?? {
        rankByPid: new Map(),
        pointsByPid: new Map(),
      };

      for (const p of participants) {
        const key = `${p.id}:${s.id}`;
        const base = cellMap.get(key)!;

        const rank = rankByPid.get(p.id) ?? null;
        const points = pointsByPid.get(p.id) ?? null;
        const weighted = points == null ? null : points * s.weight;

        cellMap.set(key, {
          ...base,
          rank,
          points,
          weighted,
        });
      }
    }

    // overall rows (genel toplamda tie-break alfabetik, rank paylaşımı yok)
    const overall = participants
      .map((p) => {
        let total = 0;
        for (const s of STAGES) {
          const pts = stageRankMaps[s.id]?.pointsByPid.get(p.id) ?? 0;
          total += pts * s.weight;
        }
        return { participant: p, total };
      })
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.participant.name.localeCompare(b.participant.name, "tr");
      })
      .map((r, idx) => ({
        participant: r.participant,
        total: r.total,
        rank: idx + 1,
      }));

    return { cellMap, overallRows: overall };
  }, [participants, valueMap, stageRankMaps]);

  function exportCsv() {
    const sep = ";";

    const headers = [
      "Genel Sıra",
      "Katılımcı",
      ...STAGES.flatMap((s) => [
        `${s.title} (${s.metric === "time" ? "dk" : "adet"})`,
        `${s.title} Puan`,
      ]),
      "Genel Toplam",
    ];

    const escape = (v: unknown) => {
      const s = String(v ?? "");
      // CSV güvenli
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

    for (const row of overallRows) {
      const cells: unknown[] = [row.rank, row.participant.name];

      for (const stage of STAGES) {
        const cell = cellMap.get(`${row.participant.id}:${stage.id}`);
        const v = cell?.value ?? null;
        const pts = cell?.points ?? "";

        // Excel TR için ondalık virgül daha iyi olabilir:
        const valueOut =
          v == null
            ? ""
            : stage.metric === "time"
            ? String(v).replace(".", ",")
            : String(v);

        cells.push(valueOut, pts);
      }

      cells.push(String(Number(row.total.toFixed(2))).replace(".", ","));
      lines.push(cells.map(escape).join(sep));
    }

    // UTF-8 BOM: Türkçe karakterler Excel’de bozulmasın
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const fileName = `swat-yarisma-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (participants.length === 0) {
    return (
      <div style={{ color: "#6B7280" }}>
        Henüz katılımcı yok. <b>Katılımcılar</b> sekmesinden ekle.
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        background: "white",
        color: "#111827",
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}
      >
        <button onClick={exportCsv} style={exportBtn}>
          Excel’e Aktar (CSV)
        </button>
      </div>{" "}
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          minWidth: 980,
          background: "white",
          color: "#111827",
        }}
      >
        <thead>
          <tr>
            <th style={thSticky}>Kişi Listesi</th>

            {STAGES.map((stage) => (
              <th key={stage.id} style={th} title={RULE_TOOLTIP}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{stage.title}</span>
                  <span style={subText}>%{formatWeight(stage.weight)}</span>
                </div>
              </th>
            ))}

            <th style={th}>
              <span>Genel Toplam</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {overallRows.map((row) => (
            <tr key={row.participant.id}>
              <td style={tdSticky}>
                {row.rank}. {row.participant.name}
              </td>

              {STAGES.map((stage) => {
                const cell = cellMap.get(`${row.participant.id}:${stage.id}`);
                const v = cell?.value ?? null;
                const pts = cell?.points ?? null;
                const rank = cell?.rank ?? null;
                const weighted = cell?.weighted ?? null;

                const cellTitle =
                  pts == null
                    ? "Bu etap için değer girilmemiş."
                    : `Sıra: ${rank}\nEtap puanı: ${pts}\nAğırlıklı katkı: ${weighted?.toFixed(
                        2
                      )} (puan × %${formatWeight(stage.weight)})`;

                return (
                  <td key={stage.id} style={td} title={cellTitle}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span>
                        {stage.metric === "time"
                          ? formatTime(v)
                          : v == null
                          ? "-"
                          : `${v} adet`}
                      </span>

                      {pts != null ? (
                        <span style={pill}>+{pts}</span>
                      ) : (
                        <span style={missing}>—</span>
                      )}
                    </div>
                  </td>
                );
              })}

              <td
                style={{ ...td, fontWeight: 800 }}
                title="Toplam ağırlıklı puan"
              >
                {Number(row.total.toFixed(2))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatWeight(w: number) {
  const pct = w * 100;
  return Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(1).replace(/\.0$/, "");
}

/* ---------------- styles ---------------- */

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  background: "#F9FAFB",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};

const thSticky: React.CSSProperties = {
  ...th,
  position: "sticky",
  left: 0,
  zIndex: 2,
};

const td: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #F3F4F6",
  whiteSpace: "nowrap",
};

const tdSticky: React.CSSProperties = {
  ...td,
  position: "sticky",
  left: 0,
  background: "white",
  zIndex: 1,
  borderRight: "1px solid #E5E7EB",
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

const subText: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  fontWeight: 600,
};

const pill: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px solid #E5E7EB",
  background: "#F3F4F6",
  color: "#111827",
};

const missing: React.CSSProperties = {
  fontSize: 12,
  padding: "3px 8px",
  borderRadius: 999,
  border: "1px dashed #E5E7EB",
  color: "#9CA3AF",
};
