"use client";

import { useEffect, useMemo, useState } from "react";
import { STAGES } from "@/lib/stages";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";

export default function ParticipantsPage() {
  const [list, setList] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [p, v] = await Promise.all([
        participantsRepo.list(),
        resultsRepo.list(),
      ]);
      if (cancelled) return;
      setList(p);
      setValues(v);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(
    () => list.slice().sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [list]
  );

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of values)
      m.set(`${v.participantId}:${v.stageId}`, v.value ?? 0);
    return m;
  }, [values]);

  async function add() {
    setError(null);
    try {
      const created = await participantsRepo.add(name);
      setList((prev) => [created, ...prev]);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  async function remove(id: string) {
    setError(null);
    try {
      await participantsRepo.remove(id);
      setList((prev) => prev.filter((p) => p.id !== id));
      setValues((prev) => prev.filter((x) => x.participantId !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu.");
    }
  }

  async function updateStageValue(
    participantId: string,
    stageId: string,
    raw: string
  ) {
    // boşsa: sil
    const trimmed = raw.trim();
    const num = trimmed === "" ? null : Number(trimmed);
    if (num !== null && Number.isNaN(num)) return;

    await resultsRepo.upsert({ participantId, stageId, value: num });

    // UI’ı anında güncelle
    setValues((prev) => {
      const next = prev.filter(
        (x) => !(x.participantId === participantId && x.stageId === stageId)
      );
      return num === null
        ? next
        : [...next, { participantId, stageId, value: num }];
    });
  }

  return (
    <div style={{ maxWidth: 1100 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
        Katılımcılar
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Katılımcı adı soyadı"
          style={input}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button onClick={add} style={button}>
          Ekle
        </button>
      </div>

      {error ? <div style={errorBox}>{error}</div> : null}

      <div style={{ color: "#6B7280", fontSize: 13, marginBottom: 8 }}>
        Toplam: <b>{sorted.length}</b>
      </div>

      <div style={card}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <thead>
            <tr>
              <th style={th}>Kişi</th>
              {STAGES.map((s) => (
                <th key={s.id} style={th}>
                  {s.title}
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    {s.metric === "time" ? "dk" : "adet"}
                  </div>
                </th>
              ))}
              <th style={th}></th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((p) => (
              <tr key={p.id}>
                <td style={td}>
                  <b>{p.name}</b>
                </td>

                {STAGES.map((s) => {
                  const key = `${p.id}:${s.id}`;
                  const current = valueMap.has(key) ? valueMap.get(key)! : "";

                  return (
                    <td key={s.id} style={td}>
                      <input
                        defaultValue={current === "" ? "" : String(current)}
                        style={miniInput}
                        placeholder={s.metric === "time" ? "0.00" : "0"}
                        onBlur={(e) =>
                          updateStageValue(p.id, s.id, e.target.value)
                        }
                      />
                    </td>
                  );
                })}

                <td style={td}>
                  <button onClick={() => remove(p.id)} style={deleteBtn}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280" }}>
        Not: Değeri boş bırakırsan o etap için “girilmedi” sayılır.
      </div>
    </div>
  );
}

/* styles */
const input: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
};
const button: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
const errorBox: React.CSSProperties = {
  marginBottom: 10,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #FCA5A5",
  background: "#FEF2F2",
  color: "#991B1B",
  fontSize: 13,
};
const card: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  background: "white",
  overflowX: "auto",
};
const th: React.CSSProperties = {
  textAlign: "left",
  padding: 12,
  background: "#F9FAFB",
  borderBottom: "1px solid #E5E7EB",
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #F3F4F6",
  whiteSpace: "nowrap",
};
const miniInput: React.CSSProperties = {
  width: 90,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
};
const deleteBtn: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 10,
  border: "1px solid #E5E7EB",
  background: "white",
  cursor: "pointer",
};
