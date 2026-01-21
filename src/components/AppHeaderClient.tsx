"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { STAGES } from "@/lib/stages";

export default function AppHeaderClient({
  isAuthed,
  showLogout,
  brandHref,
  brandTitle,
}: {
  isAuthed: boolean;
  showLogout: boolean; // sadece participants sayfasında true vereceğiz
  brandHref: string;
  brandTitle: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // dışarı tıkla kapan
  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = menuRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const activeStageId = useMemo(() => {
    // /piyade/stages/:id
    const m = pathname?.match(/\/piyade\/stages\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  return (
    <header style={wrap}>
      <div style={inner}>
        <Link href={brandHref} style={brand}>
          {brandTitle}
        </Link>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Etaplar HEP kalsın (login gerekmez) */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              style={btnGhost}
              aria-expanded={open}
            >
              Etaplar <span style={{ fontSize: 14 }}>▾</span>
            </button>

            {open && (
              <div style={menu}>
                {STAGES.map((s) => {
                  const active = activeStageId === s.id;
                  return (
                    <Link
                      key={s.id}
                      href={`/piyade/stages/${s.id}`}
                      style={{
                        ...menuItem,
                        ...(active ? menuItemActive : null),
                      }}
                      onClick={() => setOpen(false)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span>{s.title}</span>
                        <span style={pct}>%{Math.round(s.weight * 100)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Katılımcılar linki NAVBAR’da yok (sen istemiyorsun) */}
          {/* Logout SADECE participants sayfasında görünsün */}
          {showLogout && isAuthed && (
            <form action="/api/auth/logout" method="post">
              <button type="submit" style={btn}>
                Çıkış
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}

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
  fontSize: 18,
  textDecoration: "none",
  color: "#111827",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "white",
  color: "#111827",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const btn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};

const menu: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  width: 360,
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  overflow: "hidden",
  zIndex: 50,
};

const menuItem: React.CSSProperties = {
  display: "block",
  padding: "12px 14px",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
  borderBottom: "1px solid #F3F4F6",
};

const menuItemActive: React.CSSProperties = {
  background: "#F3F4F6",
};

const pct: React.CSSProperties = {
  color: "#6B7280",
  fontWeight: 800,
};
