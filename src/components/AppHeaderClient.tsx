// src/components/AppHeaderClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { STAGES } from "@/lib/stages";

export type Mode = "piyade";

type Props = {
  mode: Mode;
  isAuthed: boolean;

  showStages: boolean;
  showParticipantsLink: boolean;
  showLogout: boolean;

  brandHref: string;
  brandTitle: string;
};

export default function AppHeaderClient({
  mode,
  isAuthed,
  showStages,
  showParticipantsLink,
  showLogout,
  brandHref,
  brandTitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const stageItems = useMemo(() => {
    // Şimdilik tek STAGES seti var; keskin farklı stage setine geçersen burada mode’a göre ayırırsın.
    return STAGES;
  }, []);

  // ✅ dışarı tıklayınca dropdown kapansın
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  return (
    <header style={wrap}>
      <div style={inner} ref={wrapRef}>
        <Link href={brandHref} style={brand}>
          {brandTitle}
        </Link>

        <div style={right}>
          {/* ✅ Etaplar HER ZAMAN görünür */}
          {showStages && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={btnGhost}
                aria-expanded={open}
              >
                Etaplar <span style={{ marginLeft: 6 }}>▼</span>
              </button>

              {open && (
                <div style={dropdown}>
                  {stageItems.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${mode}/stages/${s.id}`}
                      style={dropdownItem}
                      onClick={() => setOpen(false)} // ✅ seçince kapansın
                    >
                      <span style={{ fontWeight: 900 }}>{s.title}</span>
                      <span style={percentText}>
                        %{Math.round(s.weight * 100)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Katılımcılar sadece admin’de istenirse + authed ise */}
          {showParticipantsLink && isAuthed && (
            <Link href={`/${mode}/participants`} style={btnGhost}>
              Katılımcılar
            </Link>
          )}

          {/* Çıkış sadece admin’de istenirse + authed ise */}
          {showLogout && isAuthed && (
            <form action="/api/auth/logout" method="post">
              <button type="submit" style={btnDark}>
                Çıkış
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------- styles ---------------- */

const wrap: React.CSSProperties = {
  borderBottom: "1px solid #E5E7EB",
  background: "white",
};

const inner: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "14px 18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 20,
  color: "#111827",
  textDecoration: "none",
};

const right: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "white",
  color: "#111827",
  fontWeight: 800,
  textDecoration: "none",
  cursor: "pointer",
};

const btnDark: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const dropdown: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  right: 0,
  width: 360,
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  background: "white",
  boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
  overflow: "hidden",
  zIndex: 50,
};

const dropdownItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  textDecoration: "none",
  color: "#111827",
  borderBottom: "1px solid #F3F4F6",
};

const percentText: React.CSSProperties = {
  color: "#6B7280",
  fontWeight: 900,
};
