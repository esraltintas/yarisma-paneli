"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { STAGES } from "@/lib/stages";
import { formatSecondsToMinSec } from "@/lib/format";
import Loader from "@/components/Loader";

type Mode = "piyade";
type Props = { mode: Mode };

type ParticipantRow = Participant & { createdAt?: string | Date };

function toTime(v: unknown): number {
  if (!v) return 0;
  const d = v instanceof Date ? v : new Date(String(v));
  const t = d.getTime();
  return Number.isFinite(t) ? t : 0;
}

function parseNumberSafe(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const normalized = s.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return 0;
  return n;
}

export default function ParticipantsClient({ mode }: Props) {
  const [participants, setParticipants] = useState<ParticipantRow[] | null>(
    null,
  );
  const [values, setValues] = useState<StageValue[] | null>(null);
  const [nameInput, setNameInput] = useState("");

  // ✅ local draft’lar (input akıcı kalsın)
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});

  // ✅ debounce timerlar
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [pRaw, v] = await Promise.all([
        participantsRepo.list(mode),
        resultsRepo.list(mode),
      ]);

      if (cancelled) return;

      const p = [...(pRaw as ParticipantRow[])].sort(
        (a, b) => toTime(b.createdAt) - toTime(a.createdAt),
      );

      setParticipants(p);
      setValues(v);

      // draft init
      const nextNameDrafts: Record<string, string> = {};
      for (const x of p) nextNameDrafts[x.id] = x.name;
      setNameDrafts(nextNameDrafts);

      const nextValueDrafts: Record<string, string> = {};
      for (const sv of v) {
        const key = `${sv.participantId}:${sv.stageId}`;
        if (sv.value == null) continue;
        nextValueDrafts[key] = String(sv.value).replace(".", ",");
      }
      setValueDrafts(nextValueDrafts);
    })();

    return () => {
      cancelled = true;
      // timer temizliği
      for (const k of Object.keys(saveTimers.current)) {
        clearTimeout(saveTimers.current[k]);
      }
      saveTimers.current = {};
    };
  }, [mode]);

  const valueMap = useMemo(() => {
    const m = new Map<string, number>();
    if (!values) return m;
    for (const x of values) {
      if (x.value == null) continue;
      m.set(`${x.participantId}:${x.stageId}`, x.value);
    }
    return m;
  }, [values]);

  async function refreshParticipants() {
    const pRaw = (await participantsRepo.list(mode)) as ParticipantRow[];
    const p = [...pRaw].sort(
      (a, b) => toTime(b.createdAt) - toTime(a.createdAt),
    );
    setParticipants(p);

    // name draft’ları senkronla (server yeni isim döndürdüyse)
    setNameDrafts((prev) => {
      const next = { ...prev };
      for (const x of p) {
        if (next[x.id] == null) next[x.id] = x.name;
      }
      return next;
    });
  }

  async function refreshValues() {
    const v = await resultsRepo.list(mode);
    setValues(v);

    setValueDrafts((prev) => {
      const next = { ...prev };
      for (const sv of v) {
        const key = `${sv.participantId}:${sv.stageId}`;
        if (sv.value == null) continue;
        next[key] = String(sv.value).replace(".", ",");
      }
      return next;
    });
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

  function queue(fnKey: string, fn: () => Promise<void>, ms = 450) {
    const t = saveTimers.current[fnKey];
    if (t) clearTimeout(t);
    saveTimers.current[fnKey] = setTimeout(() => {
      void fn();
      delete saveTimers.current[fnKey];
    }, ms);
  }

  function onChangeNameLocal(id: string, nextName: string) {
    setNameDrafts((m) => ({ ...m, [id]: nextName }));

    // ✅ debounce PATCH
    queue(`name:${id}`, async () => {
      const trimmed = nextName.trim();
      if (!trimmed) return;
      await participantsRepo.updateName(mode, id, trimmed);
      await refreshParticipants();
    });
  }

  function onChangeStageValueLocal(
    participantId: string,
    stageId: string,
    raw: string,
  ) {
    const key = `${participantId}:${stageId}`;
    setValueDrafts((m) => ({ ...m, [key]: raw }));

    queue(
      `val:${key}`,
      async () => {
        const v = parseNumberSafe(raw);
        await resultsRepo.setValue(mode, participantId, stageId, v);
        await refreshValues();
      },
      350,
    );
  }

  // loader
  if (!participants || !values) return <Loader />;

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
                  value={nameDrafts[p.id] ?? p.name}
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

                  const draft = valueDrafts[key];
                  const inputValue =
                    draft != null
                      ? draft
                      : current == null
                        ? ""
                        : String(current).replace(".", ",");

                  const currentForPreview =
                    draft != null ? parseNumberSafe(draft) : current;

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
                          value={inputValue}
                          onChange={(e) =>
                            onChangeStageValueLocal(p.id, s.id, e.target.value)
                          }
                          style={stageInput}
                        />
                        <span style={minutePreview}>
                          {currentForPreview == null
                            ? "-"
                            : formatSecondsToMinSec(currentForPreview)}
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
  background: "white",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const nameBox: React.CSSProperties = {
  width: 340,
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
