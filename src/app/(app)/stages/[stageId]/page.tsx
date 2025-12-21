import { notFound } from "next/navigation";
import { STAGES } from "@/lib/stages";
import { participants, results } from "@/lib/mockData";
import { calculateStageBreakdown } from "@/lib/breakdown";
import { formatTime } from "@/lib/format";

export default async function StageRankingPage({
  params,
}: {
  params: Promise<{ stageId: string }>;
}) {
  const { stageId } = await params; // ✅ Next 15 şart

  const stage = STAGES.find((s) => s.id === stageId);
  if (!stage) notFound();

  const cellMap = calculateStageBreakdown(participants, results);

  const rows = participants
    .map((p) => {
      const cell = cellMap.get(`${p.id}:${stage.id}`);
      return {
        participant: p,
        value: cell?.value ?? null,
        metric: stage.metric,
        rank: cell?.rank ?? null,
        points: cell?.points ?? null,
      };
    })
    .sort((a, b) => {
      if (a.value == null && b.value == null) return 0;
      if (a.value == null) return 1;
      if (b.value == null) return -1;

      return stage.metric === "time" ? a.value - b.value : b.value - a.value;
    });

  return (
    <div>
      <h1 style={{ marginBottom: 12, fontWeight: 600 }}>
        {stage.title} Sıralaması
      </h1>

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
              <th style={th}>{stage.metric === "time" ? "Süre" : "Adet"}</th>
              <th style={th}>Puan</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.participant.id}>
                <td style={td}>{r.rank ?? "-"}</td>
                <td style={td}>{r.participant.name}</td>
                <td style={td}>
                  {r.metric === "time"
                    ? formatTime(r.value)
                    : r.value == null
                    ? "-"
                    : `${r.value} adet`}
                </td>
                <td style={td}>{r.points ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
