"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { STAGES } from "@/lib/stages";

export default function AppHeader() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // dışarı tıklayınca kapat
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const isActive = (href: string): boolean =>
    pathname === href || pathname.startsWith(href + "/");

  const stageActive =
    pathname.startsWith("/stages/") &&
    STAGES.some((s) => pathname === `/stages/${s.id}`);

  return (
    <header style={header}>
      <div style={container}>
        <Link href="/dashboard" style={brand}>
          <img src="/favicon.ico" alt="Logo" width={22} height={22} />
          <span>SWAT Yarışması</span>
        </Link>

        <nav style={nav}>
          <NavLink href="/participants" active={isActive("/participants")}>
            Katılımcılar
          </NavLink>

          {/* Dropdown */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              style={dropdownButton(stageActive)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              Etaplar <span style={{ opacity: 0.7 }}>▾</span>
            </button>

            {open && (
              <div style={dropdown} role="menu">
                {STAGES.map((stage) => {
                  const href = `/stages/${stage.id}`;
                  const active = pathname === href;

                  return (
                    <Link
                      key={stage.id}
                      href={href}
                      style={dropdownItem(active)}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <span>{stage.title}</span>
                        <span style={dropdownSub}>
                          %{formatWeight(stage.weight)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ---------------- helpers ---------------- */

function formatWeight(w: number) {
  const pct = w * 100;
  return Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(1).replace(/\.0$/, "");
}

/* ---------------- styles ---------------- */

const header: React.CSSProperties = {
  borderBottom: "1px solid #E5E7EB",
  background: "white",
};

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "12px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  textDecoration: "none",
  fontWeight: 800,
  color: "#111827",
};

const nav: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
};

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} style={navLink(active)}>
      {children}
    </Link>
  );
}

function navLink(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: active ? 800 : 600,
    background: active ? "#111827" : "transparent",
    border: active ? "1px solid #111827" : "1px solid transparent",
    color: active ? "white" : "#111827",
  };
}

function dropdownButton(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    fontWeight: active ? 800 : 600,
    background: active ? "#111827" : "transparent",
    border: active ? "1px solid #111827" : "1px solid #E5E7EB",
    color: active ? "white" : "#111827",
    cursor: "pointer",
  };
}

const dropdown: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  minWidth: 280,
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  zIndex: 50,
};

function dropdownItem(active: boolean): React.CSSProperties {
  return {
    display: "block",
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: active ? 800 : 600,
    background: active ? "#F3F4F6" : "transparent",
    color: "#111827",
  };
}

const dropdownSub: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  fontWeight: 600,
};
