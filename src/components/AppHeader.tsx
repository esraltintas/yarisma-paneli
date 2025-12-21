"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STAGES } from "@/lib/stages";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/participants") return pathname === "/participants";
  if (href.startsWith("/stages/")) return pathname.startsWith("/stages/");
  return pathname === href;
}

function linkStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    textDecoration: "none",
    color: active ? "#111827" : "#374151",
    background: active ? "#F3F4F6" : "transparent",
    border: active ? "1px solid #E5E7EB" : "1px solid transparent",
    fontWeight: active ? 600 : 500,
    lineHeight: 1,
  };
}

export default function AppHeader() {
  const pathname = usePathname();

  const onStagesPage = pathname.startsWith("/stages/");
  const currentStageId = onStagesPage ? pathname.split("/")[2] : null;
  const currentStage = currentStageId
    ? STAGES.find((s) => s.id === currentStageId)
    : null;

  return (
    <header style={{ borderBottom: "1px solid #e5e7eb" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <img src="/favicon.ico" alt="Logo" width={24} height={24} />
          <strong style={{ color: "#111827" }}>SWAT Yarışması</strong>
        </Link>

        <nav
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            href="/participants"
            style={linkStyle(isActive(pathname, "/participants"))}
          >
            Katılımcılar
          </Link>

          {/* Dropdown (native) */}
          <details style={{ position: "relative" }} open={false}>
            <summary
              style={{
                ...linkStyle(onStagesPage),
                cursor: "pointer",
                listStyle: "none" as const,
              }}
            >
              Etaplar ▾
              {currentStage?.title ? (
                <span
                  style={{ marginLeft: 8, color: "#6B7280", fontWeight: 500 }}
                >
                  ({currentStage.title})
                </span>
              ) : null}
            </summary>

            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                minWidth: 220,
                background: "white",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                padding: 8,
                zIndex: 50,
              }}
            >
              {STAGES.map((s) => {
                const href = `/stages/${s.id}`;
                const active = pathname === href;
                return (
                  <Link
                    key={s.id}
                    href={href}
                    style={{
                      display: "block",
                      padding: "10px 10px",
                      borderRadius: 10,
                      textDecoration: "none",
                      color: active ? "#111827" : "#374151",
                      background: active ? "#F3F4F6" : "transparent",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {s.title}
                  </Link>
                );
              })}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
