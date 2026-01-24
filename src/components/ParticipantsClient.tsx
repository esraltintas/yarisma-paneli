"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { STAGES } from "@/lib/stages";
import { formatSecondsToMinSec } from "@/lib/format";

type Mode = "piyade";

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
  if (n < 0) return 0;
  return n;
}

function toIsoTime(t: string | Date | undefined): number {
  if (!t) return 0;
  const d = typeof t === "string" ? new Date(t) : t;
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export default function ParticipantsClient({ mode }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [nameInput, setNameInput] = useState("");

  // draft state (UI akıcı)
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [stageDrafts, setStageDrafts] = useState<Record<string, string>>({});

  // debounce timers
  const nameTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const stageTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

  // newest first
  const orderedParticipants = useMemo(() => {
    return [...participants].sort(
      (a, b) => toIsoTime(b.createdAt) - toIsoTime(a.createdAt),
    );
  }, [participants]);

  // value map
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
    await participantsRepo.remove(mode, id);
    await resultsRepo.removeParticipant(mode, id);

    // draft temizle
    setNameDrafts((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });

    setStageDrafts((prev) => {
      const n = { ...prev };
      for (const k of Object.keys(n)) {
        if (k.startsWith(`${id}:`)) delete n[k];
      }
      return n;
    });

    await Promise.all([refreshParticipants(), refreshValues()]);
  }

  function onChangeNameLocal(id: string, nextName: string) {
    // UI anlık
    setNameDrafts((prev) => ({ ...prev, [id]: nextName }));

    // debounce server write
    const t = nameTimers.current[id];
    if (t) clearTimeout(t);

    nameTimers.current[id] = setTimeout(async () => {
      const name = nextName.trim();

      try {
        // boş stringe izin verme (istersen burada allow edebilirsin)
        if (!name) return;

        await participantsRepo.updateName(mode, id, name);
        await refreshParticipants();

        // draft’i temizle (server senkron)
        setNameDrafts((prev) => {
          const n = { ...prev };
          delete n[id];
          return n;
        });
      } catch (e) {
        console.error("participants updateName failed:", e);
      } finally {
        delete nameTimers.current[id];
      }
    }, 600);
  }

  function onChangeStageValueLocal(
    participantId: string,
    stageId: string,
    raw: string,
  ) {
    const key = `${participantId}:${stageId}`;

    // UI anlık
    setStageDrafts((prev) => ({ ...prev, [key]: raw }));

    // debounce server write
    const t = stageTimers.current[key];
    if (t) clearTimeout(t);

    stageTimers.current[key] = setTimeout(async () => {
      try {
        const v = parseNumberSafe(raw); // null / 0 / positive
        await resultsRepo.setValue(mode, participantId, stageId, v);

        // server state'i çek (istersen daha seyrek yaparız)
        await refreshValues();

        // draft temizle (server’dan gelen değere bırak)
        setStageDrafts((prev) => {
          const n = { ...prev };
          delete n[key];
          return n;
        });
      } catch (e) {
        console.error("results setValue failed:", e);
      } finally {
        delete stageTimers.current[key];
      }
    }, 500);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
      {/* add */}
      <div style={topRow}>
        <input
          placeholder="Katılımcı adı soyadı"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={input}
        />
        <button onClick={onAddParticipant} style={addBtn}>
          Ekle
        </button>
      </div>

      {orderedParticipants.length === 0 ? (
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
          {orderedParticipants.map((p) => {
            const shownName = nameDrafts[p.id] ?? p.name;

            return (
              <div key={p.id} style={card}>
                {/* header */}
                <div style={cardHeader}>
                  <input
                    value={shownName}
                    onChange={(e) => onChangeNameLocal(p.id, e.target.value)}
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
                    const key = `${p.id}:${s.id}`;
                    const current = valueMap.get(key) ?? null;

                    const shownRaw =
                      stageDrafts[key] ??
                      (current == null
                        ? ""
                        : String(current).replace(".", ","));

                    // preview hesap (draft varsa draft'tan, yoksa current'tan)
                    const previewNumber =
                      stageDrafts[key] != null
                        ? parseNumberSafe(stageDrafts[key])
                        : current;

                    return (
                      <div key={s.id} style={stageRow}>
                        <div style={stageLeft}>
                          <div style={stageTitle}>
                            {s.title}{" "}
                            <span style={weightText}>
                              %{Math.round(s.weight * 100)}
                            </span>
                          </div>
                        </div>

                        <div style={stageRight}>
                          <input
                            inputMode="decimal"
                            placeholder="sn"
                            value={shownRaw}
                            onChange={(e) =>
                              onChangeStageValueLocal(
                                p.id,
                                s.id,
                                e.target.value,
                              )
                            }
                            style={stageInput}
                          />
                          <span style={minutePreview}>
                            {previewNumber == null
                              ? "-"
                              : formatSecondsToMinSec(previewNumber)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
  width: 320,
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
  background: "rgba(255,255,255,0.92)", // ← BURASI
  backdropFilter: "blur(2px)", // premium cam efekti
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const nameBox: React.CSSProperties = {
  width: 360,
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
