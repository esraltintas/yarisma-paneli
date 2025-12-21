import { STAGES } from "@/lib/stages";
import { participants, results } from "@/lib/mockData";
import { formatTime } from "@/lib/format";
import { calculateOverall } from "@/lib/calc";
import { calculateStageBreakdown } from "@/lib/breakdown";

const RULE_TOOLTIP = `Puanlama (süre en düşük -> en yüksek):
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

export default function DashboardPage() {
  const overallMap = calculateOverall(participants, results);
  const cellMap = calculateStageBreakdown(participants, results);

  const rows = participants
    .map((p) => ({
      participant: p,
      overall: overallMap.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.overall - a.overall);

  type Row = (typeof rows)[number];
  type RankedRow = Row & { rank: number };

  const rankedRows: RankedRow[] = [];

  let lastScore: number | null = null;
  let lastRank = 0;

  rows.forEach((row, index) => {
    const score = row.overall;

    // ilk satır veya skor değiştiyse: rank = index + 1
    if (lastScore === null || score !== lastScore) {
      lastRank = index + 1;
      lastScore = score;
    }

    rankedRows.push({ ...row, rank: lastRank });
  });

  return (
    <>
      <div
        style={{
          overflowX: "auto",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          background: "white",
          color: "#111827",
        }}
      >
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
                <th key={stage.id} style={th}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <span>{stage.title}</span>
                    </div>
                    <span style={subText}>%{formatWeight(stage.weight)}</span>
                  </div>
                </th>
              ))}

              <th style={th}>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <span>Genel Toplam</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {rankedRows.map((row) => (
              <tr key={row.participant.id}>
                <td style={tdSticky}>
                  {row.rank}. {row.participant.name}
                </td>

                {STAGES.map((stage) => {
                  const cell = cellMap.get(`${row.participant.id}:${stage.id}`);
                  const time = cell?.timeSec ?? null;
                  const pts = cell?.points ?? null;
                  const rank = cell?.rank ?? null;
                  const weighted = cell?.weighted ?? null;

                  const cellTitle =
                    pts == null
                      ? "Bu etap için süre girilmemiş."
                      : `Rank: ${rank}\nEtap puanı: ${pts}\nAğırlıklı katkı: ${weighted?.toFixed(
                          2
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
                        <span>{formatTime(time)}</span>

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
                  style={{ ...td, fontWeight: 700 }}
                  title="Toplam ağırlıklı puan"
                >
                  {Number(row.overall.toFixed(2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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

const subText: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  fontWeight: 500,
};

const pill: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
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

const infoIcon: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 18,
  height: 18,
  borderRadius: 999,
  border: "1px solid #E5E7EB",
  fontSize: 12,
  color: "#6B7280",
  cursor: "help",
  userSelect: "none",
};
