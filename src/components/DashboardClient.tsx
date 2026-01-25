"use client";

import { useEffect, useMemo, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { stagePointsByRank } from "@/lib/scoring";
import { formatTime } from "@/lib/format";
import { getStagesByMode, type Mode } from "@/lib/getStagesByMode";
import { maskName } from "@/lib/maskName";
import Loader from "@/components/Loader";
import MobileCard from "@/components/MobileCard";

type StageCell = {
  value: number | null; // time (sn)
  rank: number | null;
  points: number | null;
  weighted: number | null;
};

function useIsCompact(breakpointPx = 1024) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = () => setCompact(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [breakpointPx]);

  return compact;
}

export default function DashboardClient({ mode }: { mode: Mode }) {
  const STAGES = getStagesByMode(mode);
  const isCompact = useIsCompact(1024); // mobil + tablet

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const [p, v] = await Promise.all([
          participantsRepo.list(mode),
          resultsRepo.list(mode),
        ]);
        if (cancelled) return;
        setParticipants(p);
        setValues(v);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of values) {
      if (x.value == null) continue;
      m.set(`${x.participantId}:${x.stageId}`, x.value);
    }
    return m;
  }, [values]);

  const stageRankMaps = useMemo(() => {
    const maps: Record<
      string,
      { rankByPid: Map<string, number>; pointsByPid: Map<string, number> }
    > = {};

    for (const stage of STAGES) {
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
        const c = a.value - b.value;
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

        currentRank += groupSize;
        i = j;
      }

      maps[stage.id] = { rankByPid, pointsByPid };
    }

    return maps;
  }, [participants, valueMap, STAGES]);

  const { cellMap, overallRows } = useMemo(() => {
    const cellMap = new Map<string, StageCell>();

    for (const p of participants) {
      for (const s of STAGES) {
        const v = valueMap.get(`${p.id}:${s.id}`) ?? null;
        cellMap.set(`${p.id}:${s.id}`, {
          value: v,
          rank: null,
          points: null,
          weighted: null,
        });
      }
    }

    for (const s of STAGES) {
      const { rankByPid, pointsByPid } = stageRankMaps[s.id] ?? {
        rankByPid: new Map<string, number>(),
        pointsByPid: new Map<string, number>(),
      };

      for (const p of participants) {
        const key = `${p.id}:${s.id}`;
        const base = cellMap.get(key)!;

        const rank = rankByPid.get(p.id) ?? null;
        const points = pointsByPid.get(p.id) ?? null;
        const weighted = points == null ? null : points * s.weight;

        cellMap.set(key, { ...base, rank, points, weighted });
      }
    }

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
  }, [participants, valueMap, stageRankMaps, STAGES]);

  function exportCsv() {
    const sep = ";";
    const headers = [
      "Genel Sıra",
      "Katılımcı",
      ...STAGES.flatMap((s) => [`${s.title} (sn)`, `${s.title} Puan`]),
      "Toplam Puan",
    ];

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

    for (const row of overallRows) {
      const cells: unknown[] = [row.rank, row.participant.name];

      for (const stage of STAGES) {
        const cell = cellMap.get(`${row.participant.id}:${stage.id}`);
        const v = cell?.value ?? null;
        const pts = cell?.points ?? "";
        const valueOut = v == null ? "" : String(v).replace(".", ",");
        cells.push(valueOut, pts);
      }

      cells.push(String(Number(row.total.toFixed(2))).replace(".", ","));
      lines.push(cells.map(escape).join(sep));
    }

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swat-${mode}-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) return <Loader />;

  if (participants.length === 0) {
    return (
      <div style={{ color: "#6B7280" }}>
        Henüz katılımcı yok. <b>Katılımcılar</b> sekmesinden ekle.
      </div>
    );
  }

  // ✅ Mobil/Tablet: tablo yok, card listesi var (kaydırma yok)
  if (isCompact) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={exportCsv} style={exportBtn}>
            Excel’e Aktar (CSV)
          </button>
        </div>

        {overallRows.map((row) => {
          const totalOut = Number(row.total.toFixed(2));

          return (
            <MobileCard
              key={row.participant.id}
              collapsible
              defaultOpen={false}
              title={
                <span>
                  {row.rank}. {maskName(row.participant.name)}
                </span>
              }
              right={<span style={{ fontWeight: 900 }}>{totalOut}</span>}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {STAGES.map((stage) => {
                  const cell = cellMap.get(`${row.participant.id}:${stage.id}`);
                  const v = cell?.value ?? null;
                  const pts = cell?.points ?? null;
                  const rank = cell?.rank ?? null;

                  const left = (
                    <div
                      style={{
                        fontWeight: 900,
                        color: "#111827",
                        lineHeight: 1.2,
                      }}
                    >
                      {stage.title}
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#6B7280",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        %{formatWeight(stage.weight)}
                      </span>
                    </div>
                  );

                  const right = (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ fontWeight: 900 }}>
                        {v == null ? "-" : formatTime(v)}
                      </span>
                      {pts != null ? (
                        <span style={pill}>+{pts}</span>
                      ) : (
                        <span style={missing}>—</span>
                      )}
                    </div>
                  );

                  const hint =
                    pts == null
                      ? "Bu etap için değer girilmemiş."
                      : `Sıra: ${rank} • Etap puanı: ${pts}`;

                  return (
                    <div
                      key={stage.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        alignItems: "center",
                        padding: "10px 12px",
                        border: "1px solid #F3F4F6",
                        borderRadius: 12,
                        background: "white",
                      }}
                      title={hint}
                    >
                      <div style={{ minWidth: 0 }}>{left}</div>
                      <div style={{ flexShrink: 0 }}>{right}</div>
                    </div>
                  );
                })}
              </div>
            </MobileCard>
          );
        })}
      </div>
    );
  }

  // ✅ Web/Desktop: mevcut tablo
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <button onClick={exportCsv} style={exportBtn}>
          Excel’e Aktar (CSV)
        </button>
      </div>

      <div style={wrap}>
        <table style={table}>
          <thead>
            <tr>
              <th style={thSticky}>Kişi Listesi</th>

              {STAGES.map((stage) => (
                <th key={stage.id} style={th}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span>{stage.title}</span>
                    <span style={subText}>%{formatWeight(stage.weight)}</span>
                  </div>
                </th>
              ))}

              <th style={th}>Toplam Puan</th>
            </tr>
          </thead>

          <tbody>
            {overallRows.map((row) => (
              <tr key={row.participant.id}>
                <td style={tdSticky}>
                  {row.rank}. {maskName(row.participant.name)}
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
                          2,
                        )} (puan × %${formatWeight(stage.weight)})`;

                  return (
                    <td key={stage.id} style={td} title={cellTitle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>{v == null ? "-" : formatTime(v)}</span>
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

const wrap: React.CSSProperties = {
  overflowX: "auto",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  color: "#111827",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  minWidth: 980,
  color: "#111827",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
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
  zIndex: 1,
  borderRight: "1px solid #E5E7EB",
};

const exportBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
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
