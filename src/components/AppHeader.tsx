"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STAGES } from "@/lib/stages";

export default function AppHeader() {
  const pathname = usePathname();

  const isPiyade = pathname.startsWith("/piyade");
  const isLogin = pathname.startsWith("/login");

  // Bu projede artık ana kullanım piyade:
  const base = isPiyade ? "/piyade" : "";

  // login ve root sayfasında nav istemiyorsun
  const showNav = !isLogin && base !== "";

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <header style={header}>
      <div style={inner}>
        <Link href={base ? `${base}/dashboard` : "/"} style={brand}>
          Swat Challange Mülakat Paneli
        </Link>

        {showNav ? (
          <nav style={nav}>
            <Link
              href={`${base}/participants`}
              style={navLink(pathname === `${base}/participants`)}
            >
              Katılımcılar
            </Link>

            <details style={{ position: "relative" }}>
              <summary style={dropdownBtn}>
                Etaplar <span style={{ fontSize: 12 }}>▼</span>
              </summary>

              <div style={menu}>
                {STAGES.map((s) => {
                  const href = `${base}/stages/${s.id}`;
                  const active = pathname === href;

                  return (
                    <Link key={s.id} href={href} style={menuItem(active)}>
                      <span>{s.title}</span>
                      <span style={weightText}>%{formatWeight(s.weight)}</span>
                    </Link>
                  );
                })}
              </div>
            </details>

            <button onClick={logout} style={logoutBtn}>
              Çıkış
            </button>
          </nav>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
}

function formatWeight(w: number) {
  const pct = w * 100;
  return Number.isInteger(pct)
    ? String(pct)
    : pct.toFixed(1).replace(/\.0$/, "");
}

/* styles */

const header: React.CSSProperties = {
  borderBottom: "1px solid #E5E7EB",
  background: "white",
};

const inner: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "16px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brand: React.CSSProperties = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 900,
  fontSize: 20,
};

const nav: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const navLink = (active: boolean): React.CSSProperties => ({
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
  padding: "10px 14px",
  borderRadius: 12,
  background: active ? "#F3F4F6" : "transparent",
});

const dropdownBtn: React.CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  userSelect: "none",
  padding: "10px 14px",
  borderRadius: 12,
  background: "#F3F4F6",
  fontWeight: 800,
  color: "#111827",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const menu: React.CSSProperties = {
  position: "absolute",
  right: 0,
  marginTop: 10,
  width: 360,
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  background: "white",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  zIndex: 50,
};

const menuItem = (active: boolean): React.CSSProperties => ({
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 14px",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 900,
  background: active ? "#F9FAFB" : "white",
  borderBottom: "1px solid #F3F4F6",
});

const weightText: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  fontWeight: 800,
};

const logoutBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "white",
  fontWeight: 800,
  cursor: "pointer",
};
