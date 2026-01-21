"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTime } from "@/lib/format";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue, type Mode } from "@/lib/resultsRepo";
import { STAGES, type Stage } from "@/lib/stages";

type Props = {
  mode: Mode;
};

function getStagesByMode(mode: Mode): Stage[] {
  // Şimdilik: tek STAGES kullanıyorsan bu yeterli.
  // Eğer ileride mode'a göre stage setin ayrışırsa burada split edersin.
  return STAGES;
}

export default function ParticipantsClient({ mode }: Props) {
  const stages = useMemo(() => getStagesByMode(mode), [mode]);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [nameInput, setNameInput] = useState("");

  // ✅ 1 kere yükle
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

  // participantId:stageId -> value
  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of values) {
      if (x.value == null) continue;
      m.set(`${x.participantId}:${x.stageId}`, x.value);
    }
    return m;
  }, [values]);

  async function refreshValues() {
    const v = await resultsRepo.list(mode);
    setValues(v);
  }

  async function refreshParticipants() {
    const p = await participantsRepo.list(mode);
    setParticipants(p);
  }

  async function onAddParticipant() {
    const name = nameInput.trim();
    if (!name) return;

    await participantsRepo.add(mode, name);
    setNameInput("");
    await refreshParticipants();
  }

  async function onDeleteParticipant(id: string) {
    await participantsRepo.remove(mode, id);
    await resultsRepo.removeParticipant(mode, id);
    await Promise.all([refreshParticipants(), refreshValues()]);
  }

  async function onRenameParticipant(id: string, name: string) {
    await participantsRepo.rename(mode, id, name);
    await refreshParticipants();
  }

  async function onChangeStageValue(
    participantId: string,
    stageId: string,
    raw: string,
  ) {
    // ✅ UI-level eksi engeli + boşsa null
    const v =
      raw.trim() === "" ? null : Math.max(0, Number(raw.replace(",", ".")));

    await resultsRepo.set(mode, participantId, stageId, v);
    await refreshValues();
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
      <div style={topRow}>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Katılımcı adı"
          style={nameInputStyle}
        />
        <button onClick={onAddParticipant} style={btnPrimary}>
          Ekle
        </button>
      </div>

      {participants.length === 0 ? (
        <div style={{ color: "#6B7280", marginTop: 18 }}>
          Henüz katılımcı yok.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
          {participants.map((p) => (
            <div key={p.id} style={card}>
              <div style={cardHeader}>
                <input
                  defaultValue={p.name}
                  onBlur={(e) => onRenameParticipant(p.id, e.target.value)}
                  style={nameEdit}
                />
                <button
                  onClick={() => onDeleteParticipant(p.id)}
                  style={btnDanger}
                >
                  Sil
                </button>
              </div>

              <div style={stageGrid}>
                {stages.map((s) => {
                  const v = valueMap.get(`${p.id}:${s.id}`) ?? null;

                  return (
                    <div key={s.id} style={stageRow}>
                      <div style={stageTitle}>
                        {s.title}
                        <span style={stageWeight}>
                          %{Math.round(s.weight * 100)}
                        </span>
                      </div>

                      <div style={stageRight}>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="0.01"
                          placeholder="sn"
                          defaultValue={v ?? ""}
                          onChange={(e) =>
                            onChangeStageValue(p.id, s.id, e.target.value)
                          }
                          onWheel={(e) =>
                            (e.currentTarget as HTMLInputElement).blur()
                          }
                          style={numInput}
                        />
                        <div style={valueHint}>
                          {v == null ? "-" : `${formatTime(v)} `}
                        </div>
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

const nameInputStyle: React.CSSProperties = {
  width: 240,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  fontSize: 14,
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const card: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 16,
  background: "white",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 14,
};

const nameEdit: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 900,
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: "10px 12px",
  width: 260,
  outline: "none",
};

const btnDanger: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #DC2626",
  background: "#DC2626",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const stageGrid: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const stageRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const stageTitle: React.CSSProperties = {
  fontWeight: 800,
  color: "#111827",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const stageWeight: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#6B7280",
};

const stageRight: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const numInput: React.CSSProperties = {
  width: 140,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  fontSize: 14,
};

const valueHint: React.CSSProperties = {
  width: 90,
  fontSize: 13,
  color: "#6B7280",
  fontWeight: 700,
  textAlign: "left",
};

const footNote: React.CSSProperties = {
  marginTop: 12,
  fontSize: 12,
  color: "#6B7280",
};
