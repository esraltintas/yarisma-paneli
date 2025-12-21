"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STAGES } from "@/lib/stages";

export default function AppHeader() {
  const pathname = usePathname();

  const isDashboard = pathname === "/dashboard";
  const isParticipants = pathname === "/participants";
  const isStages = pathname.startsWith("/stages/");

  return (
    <header style={{ borderBottom: "1px solid #E5E7EB" }}>
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
            fontWeight: 700,
            color: "#111827",
          }}
        >
          <img src="/favicon.ico" alt="Logo" width={24} height={24} />
          SWAT Yarışması
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <NavLink href="/dashboard" active={isDashboard}>
            Dashboard
          </NavLink>

          <NavLink href="/participants" active={isParticipants}>
            Katılımcılar
          </NavLink>

          <details style={{ position: "relative" }}>
            {/* Aktif stil hydration’da farklılık yaratırsa sorun çıkmasın diye */}
            <summary style={summaryStyle(isStages)} suppressHydrationWarning>
              Etaplar ▾
            </summary>

            <div style={dropdown}>
              {STAGES.map((stage) => {
                const href = `/stages/${stage.id}`;
                const active = pathname === href;

                return (
                  <Link
                    key={stage.id}
                    href={href}
                    style={{
                      display: "block",
                      padding: "8px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: active ? 700 : 500,
                      background: active ? "#F3F4F6" : "transparent",
                      color: "#111827",
                    }}
                    suppressHydrationWarning
                  >
                    {stage.title}
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
    <Link
      href={href}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        textDecoration: "none",
        fontWeight: active ? 700 : 500,
        background: active ? "#F3F4F6" : "transparent",
        border: active ? "1px solid #E5E7EB" : "1px solid transparent",
        color: "#111827",
      }}
      suppressHydrationWarning
    >
      {children}
    </Link>
  );
}

function summaryStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    listStyle: "none",
    fontWeight: active ? 700 : 500,
    background: active ? "#F3F4F6" : "transparent",
    border: active ? "1px solid #E5E7EB" : "1px solid transparent",
    color: "#111827",
  };
}

const dropdown: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  minWidth: 200,
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 8,
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  zIndex: 50,
};
