import { STAGES } from "@/lib/stages";
import { participants, results } from "@/lib/mockData";
import { formatTime } from "@/lib/format";
import { calculateOverall } from "@/lib/calc";
import { calculateStageBreakdown } from "@/lib/breakdown";

export default function DashboardPage() {
  const overallMap = calculateOverall(participants, results);
  const cellMap = calculateStageBreakdown(participants, results);

  // ✅ Overall: desc, tie -> alfabetik (TR)
  const rows = participants
    .map((p) => ({
      participant: p,
      overall: overallMap.get(p.id) ?? 0,
    }))
    .sort((a, b) => {
      const ao = Number(a.overall.toFixed(2));
      const bo = Number(b.overall.toFixed(2));

      if (bo !== ao) return bo - ao;
      return a.participant.name.localeCompare(b.participant.name, "tr");
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
            {rows.map((row, index) => (
              <tr key={row.participant.id}>
                <td style={tdSticky}>
                  {index + 1}. {row.participant.name}
                </td>

                {STAGES.map((stage) => {
                  const cell = cellMap.get(`${row.participant.id}:${stage.id}`);
                  const v = cell?.value ?? null;
                  const pts = cell?.points ?? null;
                  const rank = cell?.rank ?? null;
                  const weighted = cell?.weighted ?? null;

                  const valueText =
                    cell?.metric === "time"
                      ? formatTime(v)
                      : v == null
                      ? "-"
                      : `${v} adet`;

                  const cellTitle =
                    pts == null
                      ? "Bu etap için veri girilmemiş."
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
                        <span>{valueText}</span>

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
                  {row.overall.toFixed(2)}
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
