"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { STAGES } from "@/lib/stages";
import { formatSecondsToMinSec } from "@/lib/format";

type Mode = "piyade";
type Props = { mode: Mode };

function parseNumberSafe(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;

  const normalized = s.replace(",", ".");
  const n = Number(normalized);

  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0; // ✅ eksi yok
  return n;
}

function keyOf(pid: string, sid: string) {
  return `${pid}:${sid}`;
}

export default function ParticipantsClient({ mode }: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [nameInput, setNameInput] = useState("");

  // ✅ Kullanıcı yazarken anında gösterilecek local draft
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // ✅ Debounce timer’lar (field bazlı)
  const saveTimers = useRef<Record<string, number>>({});

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
      // cleanup timers
      for (const k of Object.keys(saveTimers.current)) {
        window.clearTimeout(saveTimers.current[k]);
      }
      saveTimers.current = {};
    };
  }, [mode]);

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of values) {
      if (x.value == null) continue;
      m.set(keyOf(x.participantId, x.stageId), x.value);
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
    await Promise.all([refreshParticipants(), refreshValues()]);
  }

  async function onChangeName(id: string, nextName: string) {
    await participantsRepo.updateName(mode, id, nextName);
    await refreshParticipants();
  }

  function scheduleSave(participantId: string, stageId: string, raw: string) {
    const k = keyOf(participantId, stageId);

    // önce varsa eski timer’ı iptal et
    if (saveTimers.current[k]) window.clearTimeout(saveTimers.current[k]);

    // 350ms sonra kaydet (debounce)
    saveTimers.current[k] = window.setTimeout(async () => {
      try {
        const v = parseNumberSafe(raw);
        await resultsRepo.setValue(mode, participantId, stageId, v);
        await refreshValues();
      } catch (e) {
        console.error(e);
        // istersen burada toast vb. gösterebilirsin
      }
    }, 350);
  }

  function onChangeStageValue(
    participantId: string,
    stageId: string,
    raw: string,
  ) {
    const k = keyOf(participantId, stageId);

    // ✅ kullanıcı yazarken UI anında güncellenir
    setDrafts((prev) => ({ ...prev, [k]: raw }));

    // ✅ arkada debounce ile DB’ye yaz
    scheduleSave(participantId, stageId, raw);
  }

  function getInputValue(participantId: string, stageId: string) {
    const k = keyOf(participantId, stageId);

    // draft varsa onu göster
    if (drafts[k] != null) return drafts[k];

    // yoksa DB değerini göster
    const current = valueMap.get(k) ?? null;
    return current == null ? "" : String(current).replace(".", ",");
  }

  function getPreview(participantId: string, stageId: string) {
    const k = keyOf(participantId, stageId);

    // draft varsa preview’u draft’tan hesapla (hızlı his)
    const d = drafts[k];
    if (d != null) {
      const v = parseNumberSafe(d);
      return v == null ? "-" : formatSecondsToMinSec(v);
    }

    const current = valueMap.get(k) ?? null;
    return current == null ? "-" : formatSecondsToMinSec(current);
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
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

              <div style={{ display: "grid", gap: 14 }}>
                {STAGES.map((s) => (
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
                        value={getInputValue(p.id, s.id)}
                        onChange={(e) =>
                          onChangeStageValue(p.id, s.id, e.target.value)
                        }
                        style={stageInput}
                      />
                      <span style={minutePreview}>
                        {getPreview(p.id, s.id)}
                      </span>
                    </div>
                  </div>
                ))}
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
