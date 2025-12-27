"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStagesByMode, type Mode } from "@/lib/getStagesByMode";

function getModeFromPath(pathname: string): Mode | null {
  if (pathname.startsWith("/piyade")) return "piyade";
  if (pathname.startsWith("/keskin")) return "keskin";
  return null; // anasayfa
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppHeader() {
  const pathname = usePathname();
  const mode = getModeFromPath(pathname);

  // 🏠 Ana sayfa
  const isHome = pathname === "/";

  const stages = mode ? getStagesByMode(mode) : [];
  const participantsHref = mode ? `/${mode}/participants` : "#";
  const stageHref = (stageId: string) => `/${mode}/stages/${stageId}`;

  return (
    <header
      style={{
        borderBottom: "1px solid #E5E7EB",
        background: "white",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Sol: Logo */}
        <Link
          href="/"
          style={{
            fontWeight: 900,
            fontSize: 16,
            color: "#111827",
            textDecoration: "none",
          }}
        >
          Swat Challange Mülakat Paneli
        </Link>

        {/* Sağ: Menü (sadece piyade / keskin içindeyken) */}
        {!isHome && mode && (
          <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href={participantsHref}
              style={navLink(isActive(pathname, participantsHref))}
            >
              Katılımcılar
            </Link>

            {/* Etaplar dropdown */}
            <details style={{ position: "relative" }}>
              <summary
                style={summaryBtn(isActive(pathname, `/${mode}/stages`))}
              >
                Etaplar ▾
              </summary>

              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                  minWidth: 260,
                  overflow: "hidden",
                }}
              >
                {stages.map((s) => {
                  const href = stageHref(s.id);
                  const active = isActive(pathname, href);

                  return (
                    <Link
                      key={s.id}
                      href={href}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        textDecoration: "none",
                        color: "#111827",
                        background: active ? "#F3F4F6" : "transparent",
                        fontWeight: active ? 800 : 600,
                      }}
                    >
                      <span>{s.title}</span>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        %{formatWeight(s.weight)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </details>
          </nav>
        )}
      </div>
    </header>
  );
}

/* helpers */

function formatWeight(w: number) {
  const pct = w * 100;
  return Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(1).replace(/\.0$/, "");
}

function navLink(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#111827",
    fontWeight: active ? 900 : 700,
    background: active ? "#F3F4F6" : "transparent",
  };
}

function summaryBtn(active: boolean): React.CSSProperties {
  return {
    listStyle: "none",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    userSelect: "none",
    color: "#111827",
    fontWeight: active ? 900 : 700,
    background: active ? "#F3F4F6" : "transparent",
  };
}
