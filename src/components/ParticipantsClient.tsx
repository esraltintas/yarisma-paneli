"use client";

import { useEffect, useMemo, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { STAGES } from "@/lib/stages";
import { formatSecondsToMinSec } from "@/lib/format";

type Mode = "piyade"; // şimdilik sadece piyade

type Props = {
  mode: Mode;
};

function parseNumberSafe(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  // TR input: 1,25 -> 1.25
  const normalized = s.replace(",", ".");
  const n = Number(normalized);

  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0; // ✅ eksiye izin yok
  return n;
}

export default function ParticipantsClient({ mode }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [nameInput, setNameInput] = useState("");

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
    const m = new Map<string, number>();
    for (const x of values) {
      if (x.value == null) continue;
      m.set(`${x.participantId}:${x.stageId}`, x.value);
    }
    return m;
  }, [values]);

  async function refreshParticipants() {
    const p = await participantsRepo.list(mode);
    setParticipants(p);
  }

  async function refreshValues() {
    const v = await resultsRepo.list(mode);
    setValues(v);
  }

  async function onAddParticipant() {
    const name = nameInput.trim();
    if (!name) return;

    await participantsRepo.add(mode, name);
    setNameInput("");

    await refreshParticipants();
  }

  async function onDeleteParticipant(id: string) {
    // ✅ önce participant sil
    await participantsRepo.remove(mode, id);

    // ✅ participant’a bağlı tüm stage sonuçlarını da temizle
    await resultsRepo.removeParticipant(mode, id);

    await Promise.all([refreshParticipants(), refreshValues()]);
  }

  async function onChangeName(id: string, nextName: string) {
    await participantsRepo.update(mode, id, nextName);
    await refreshParticipants();
  }

  async function onChangeStageValue(
    participantId: string,
    stageId: string,
    raw: string,
  ) {
    const v = parseNumberSafe(raw); // ✅ null/0/positive

    await resultsRepo.set(mode, participantId, stageId, v);
    await refreshValues();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
      {/* add */}
      <div style={topRow}>
        <input
          placeholder="Katılımcı adı"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={input}
        />
        <button onClick={onAddParticipant} style={addBtn}>
          Ekle
        </button>
      </div>

      {participants.length === 0 ? (
        <div style={{ marginTop: 20, color: "#6B7280" }}>
          Henüz katılımcı yok.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 18,
          }}
        >
          {participants.map((p) => (
            <div key={p.id} style={card}>
              {/* header */}
              <div style={cardHeader}>
                <input
                  value={p.name}
                  onChange={(e) => onChangeName(p.id, e.target.value)}
                  style={nameBox}
                />

                <button
                  onClick={() => onDeleteParticipant(p.id)}
                  style={deleteBtn}
                >
                  Sil
                </button>
              </div>

              {/* stages */}
              <div style={{ display: "grid", gap: 14 }}>
                {STAGES.map((s) => {
                  const current = valueMap.get(`${p.id}:${s.id}`) ?? null;

                  return (
                    <div key={s.id} style={stageRow}>
                      {/* stage title */}
                      <div style={stageLeft}>
                        <div style={stageTitle}>
                          {s.title}{" "}
                          <span style={weightText}>
                            %{Math.round(s.weight * 100)}
                          </span>
                        </div>
                      </div>

                      {/* input + minute preview */}
                      <div style={stageRight}>
                        <input
                          inputMode="decimal"
                          placeholder="sn"
                          value={
                            current == null
                              ? ""
                              : String(current).replace(".", ",")
                          }
                          onChange={(e) =>
                            onChangeStageValue(p.id, s.id, e.target.value)
                          }
                          style={stageInput}
                        />
                        <span style={minutePreview}>
                          {current == null
                            ? "-"
                            : formatSecondsToMinSec(current)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- styles ---------------- */

const topRow: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const input: React.CSSProperties = {
  width: 280,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  fontSize: 16,
};

const addBtn: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const card: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 18,
  background: "white",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const nameBox: React.CSSProperties = {
  width: 300,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  fontWeight: 800,
  fontSize: 16,
};

const deleteBtn: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 14,
  border: "none",
  background: "#D92D20",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const stageRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 340px",
  gap: 14,
  alignItems: "center",
};

const stageLeft: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const stageTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#111827",
};

const weightText: React.CSSProperties = {
  marginLeft: 8,
  fontSize: 14,
  fontWeight: 800,
  color: "#6B7280",
};

const stageRight: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  justifyContent: "flex-end",
};

const stageInput: React.CSSProperties = {
  width: 180,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  fontSize: 16,
};

const minutePreview: React.CSSProperties = {
  width: 120,
  fontWeight: 900,
  color: "#6B7280",
};
