// src/components/ParticipantsClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { participantsRepo, type Participant } from "@/lib/participantsRepo";
import { resultsRepo, type StageValue } from "@/lib/resultsRepo";
import { getStagesByMode, type Mode } from "@/lib/getStagesByMode";
import Loader from "@/components/Loader";
import MobileCard from "@/components/MobileCard";

type Props = { mode: Mode };

function parseNumberDraft(
  s: string,
): { ok: true; value: number | null } | { ok: false } {
  const t = (s ?? "").trim();
  if (!t) return { ok: true, value: null };
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n)) return { ok: false };
  return { ok: true, value: n };
}

export default function ParticipantsClient({ mode }: Props) {
  const STAGES = getStagesByMode(mode);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [values, setValues] = useState<StageValue[]>([]);
  const [loading, setLoading] = useState(true);

  // add input
  const [nameInput, setNameInput] = useState("");

  // local drafts (beklemeden yaz)
  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});

  // debounce timers
  const nameTimers = useRef<Record<string, number>>({});
  const valueTimers = useRef<Record<string, number>>({});

  async function refreshAll() {
    const [p, v] = await Promise.all([
      participantsRepo.list(mode),
      resultsRepo.list(mode),
    ]);

    // ✅ en son eklenen üstte
    const sorted = [...p].sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });

    setParticipants(sorted);
    setValues(v);

    // drafts senk (name)
    setNameDrafts((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const pp of sorted) {
        if (next[pp.id] == null) next[pp.id] = pp.name ?? "";
      }
      for (const k of Object.keys(next)) {
        if (!sorted.find((x) => x.id === k)) delete next[k];
      }
      return next;
    });

    // drafts senk (values)
    setValueDrafts((prev) => {
      const next: Record<string, string> = { ...prev };

      for (const x of v) {
        const key = `${x.participantId}:${x.stageId}`;
        if (next[key] == null) {
          next[key] = x.value == null ? "" : String(x.value).replace(".", ",");
        }
      }

      // prune removed participants
      const alivePids = new Set(sorted.map((pp) => pp.id));
      for (const k of Object.keys(next)) {
        const [pid] = k.split(":");
        if (pid && !alivePids.has(pid)) delete next[k];
      }

      return next;
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        await refreshAll();
        if (cancelled) return;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;

      // timers cleanup
      for (const id of Object.keys(nameTimers.current)) {
        window.clearTimeout(nameTimers.current[id]);
      }
      for (const id of Object.keys(valueTimers.current)) {
        window.clearTimeout(valueTimers.current[id]);
      }
      nameTimers.current = {};
      valueTimers.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // quick lookup current value
  const valueMap = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const x of values)
      m.set(`${x.participantId}:${x.stageId}`, x.value ?? null);
    return m;
  }, [values]);

  async function addParticipant() {
    const name = nameInput.trim();
    if (!name) return;
    await participantsRepo.add(mode, name);
    setNameInput("");
    await refreshAll();
  }

  async function deleteParticipant(id: string) {
    await participantsRepo.remove(mode, id);
    await refreshAll();
  }

  function setNameDraft(id: string, nextVal: string) {
    setNameDrafts((d) => ({ ...d, [id]: nextVal }));

    if (nameTimers.current[id]) window.clearTimeout(nameTimers.current[id]);
    nameTimers.current[id] = window.setTimeout(async () => {
      const payload = nextVal.trim();
      if (!payload) return;

      await participantsRepo.updateName(mode, id, payload);
      await refreshAll();
    }, 450);
  }

  function setStageDraft(pid: string, stageId: string, nextVal: string) {
    const key = `${pid}:${stageId}`;
    setValueDrafts((d) => ({ ...d, [key]: nextVal }));

    if (valueTimers.current[key]) window.clearTimeout(valueTimers.current[key]);
    valueTimers.current[key] = window.setTimeout(async () => {
      const parsed = parseNumberDraft(nextVal);
      if (!parsed.ok) return;

      await resultsRepo.setValue(mode, pid, stageId, parsed.value);

      // ✅ hafif güncelleme: sadece values yenile
      const fresh = await resultsRepo.list(mode);
      setValues(fresh);
    }, 450);
  }

  if (loading) return <Loader />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ✅ Input + Ekle yan yana (mobilde de) */}
      <div style={addRow}>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Katılımcı adı soyadı"
          style={addInput}
        />

        <button type="button" onClick={addParticipant} style={addBtn}>
          Ekle
        </button>
      </div>

      {/* List */}
      {participants.length === 0 ? (
        <div style={{ color: "#6B7280", fontWeight: 700 }}>
          Henüz katılımcı yok.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {participants.map((p) => {
            const nameDraft = nameDrafts[p.id] ?? p.name ?? "";

            return (
              <MobileCard
                key={p.id}
                collapsible
                defaultOpen={false}
                title={
                  <div style={cardTitleRow}>
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(p.id, e.target.value)}
                      style={nameInputStyle}
                      aria-label="Katılımcı adı soyadı"
                    />
                  </div>
                }
                /* ✅ Sil sadece accordion içinde (footer) */
                footer={
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => deleteParticipant(p.id)}
                      style={deleteBtn}
                    >
                      Sil
                    </button>
                  </div>
                }
              >
                {/* Stage inputs */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {STAGES.map((s) => {
                    const key = `${p.id}:${s.id}`;
                    const draft =
                      valueDrafts[key] ??
                      (valueMap.get(key) == null
                        ? ""
                        : String(valueMap.get(key)!).replace(".", ","));

                    return (
                      <div key={s.id} style={stageCard}>
                        {/* ✅ Başlık + % sağda */}
                        <div style={stageTopRow}>
                          <div style={stageTitle}>{s.title}</div>
                          <div style={stageWeight}>
                            %{Math.round(s.weight * 100)}
                          </div>
                        </div>

                        {/* ✅ input + "sn" input içinde */}
                        <div style={stageInputWrap}>
                          <input
                            inputMode="decimal"
                            value={draft}
                            onChange={(e) =>
                              setStageDraft(p.id, s.id, e.target.value)
                            }
                            placeholder="sn"
                            style={stageInput}
                          />
                          <span style={stageSuffix}>sn</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </MobileCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- styles ---------------- */

const addRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const addInput: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  fontWeight: 800,
  outline: "none",
};

const addBtn: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 14,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  flexShrink: 0,
};

const cardTitleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minWidth: 0,
  width: "100%",
};

const nameInputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  fontWeight: 900,
  outline: "none",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const stageCard: React.CSSProperties = {
  border: "1px solid #F3F4F6",
  borderRadius: 14,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const stageTopRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 10,
};

const stageTitle: React.CSSProperties = {
  fontWeight: 900,
  color: "#111827",
  lineHeight: 1.2,
  wordBreak: "break-word",
};

const stageWeight: React.CSSProperties = {
  color: "#6B7280",
  fontWeight: 900,
  fontSize: 12,
  flexShrink: 0,
};

const stageInputWrap: React.CSSProperties = {
  position: "relative",
};

const stageInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 46px 12px 14px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  fontWeight: 900,
  outline: "none",
};

const stageSuffix: React.CSSProperties = {
  position: "absolute",
  right: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#6B7280",
  fontWeight: 900,
  fontSize: 12,
  pointerEvents: "none",
};

const deleteBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "#DC2626",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
