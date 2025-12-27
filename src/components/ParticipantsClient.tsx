"use client";

import { useEffect, useMemo, useState } from "react";
import { getStagesByMode, type Mode } from "@/lib/getStagesByMode";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { formatTime } from "@/lib/format";

export default function ParticipantsClient({ mode }: { mode: Mode }) {
  const STAGES = useMemo(() => getStagesByMode(mode), [mode]);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [newName, setNewName] = useState("");

  // 1) load
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

  // 2) quick lookup: pid:stageId -> value
  const valueMap = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const x of values) {
      m.set(`${x.participantId}:${x.stageId}`, x.value ?? null);
    }
    return m;
  }, [values]);

  async function refresh() {
    const [p, v] = await Promise.all([
      participantsRepo.list(mode),
      resultsRepo.list(mode),
    ]);
    setParticipants(p);
    setValues(v);
  }

  async function addParticipant() {
    const name = newName.trim();
    if (!name) return;

    await participantsRepo.add(name, mode);
    setNewName("");
    await refresh();
  }

  async function removeParticipant(participantId: string) {
    if (!confirm("Bu katılımcı silinsin mi?")) return;

    await participantsRepo.remove(participantId, mode);
    await resultsRepo.removeByParticipant(mode, participantId);
    await refresh();
  }

  async function updateParticipantName(participantId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    await participantsRepo.updateName(participantId, trimmed, mode);
    await refresh();
  }

  async function upsertValue(
    participantId: string,
    stageId: string,
    raw: string
  ) {
    const s = raw.trim();
    const value =
      s === "" ? null : Number.isFinite(Number(s)) ? Number(s) : null;

    await resultsRepo.upsert({
      mode,
      participantId,
      stageId,
      value,
    });

    // UI hızlı güncellensin diye local state’i de güncelle
    setValues((prev) => {
      const next = prev.filter(
        (x) => !(x.participantId === participantId && x.stageId === stageId)
      );
      next.push({ participantId, stageId, value });
      return next;
    });
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      {/* Add */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Katılımcı adı"
          style={input}
        />
        <button onClick={addParticipant} style={btnPrimary}>
          Ekle
        </button>
      </div>

      {/* List */}
      {participants.length === 0 ? (
        <div style={{ color: "#6B7280" }}>Henüz katılımcı yok.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {participants.map((p) => (
            <div key={p.id} style={card}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  defaultValue={p.name}
                  onBlur={(e) => updateParticipantName(p.id, e.target.value)}
                  style={{ ...input, maxWidth: 320, fontWeight: 800 }}
                />
                <button
                  onClick={() => removeParticipant(p.id)}
                  style={btnDanger}
                >
                  Sil
                </button>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {STAGES.map((stage) => {
                  const v = valueMap.get(`${p.id}:${stage.id}`) ?? null;

                  return (
                    <div key={stage.id} style={row}>
                      <div style={{ fontWeight: 800 }}>{stage.title}</div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <input
                          defaultValue={v ?? ""}
                          placeholder="dk"
                          type="number"
                          step="0.01"
                          onBlur={(e) =>
                            upsertValue(p.id, stage.id, e.target.value)
                          }
                          style={{ ...input, width: 120 }}
                        />
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6B7280",
                            minWidth: 70,
                          }}
                        >
                          {v == null ? "—" : formatTime(v)}
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

/* styles */

const card: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  background: "white",
  padding: 16,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 240px",
  gap: 12,
  alignItems: "center",
  padding: "8px 0",
};

const input: React.CSSProperties = {
  height: 40,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  outline: "none",
  fontSize: 14,
};

const btnPrimary: React.CSSProperties = {
  height: 40,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  height: 40,
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid #DC2626",
  background: "#DC2626",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
