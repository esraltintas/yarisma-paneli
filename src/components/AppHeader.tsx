import Link from "next/link";
import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/auth";
import { STAGES } from "@/lib/stages";

export default async function AppHeader({
  showParticipantsLink = false, // sadece participants sayfasında true yapacağız
  showLogout = false, // sadece participants sayfasında true yapacağız
}: {
  showParticipantsLink?: boolean;
  showLogout?: boolean;
}) {
  const cookieStore = await cookies();
  const isAuthed = Boolean(cookieStore.get(sessionCookieName())?.value);

  return (
    <header style={wrap}>
      <div style={inner}>
        <Link href="/piyade/dashboard" style={brand}>
          Swat Challange Mülakat Paneli
        </Link>

        <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* ✅ ETAPLAR HER ZAMAN GÖRÜNÜR (login yok) */}
          <details style={{ position: "relative" }}>
            <summary style={btnGhost}>Etaplar ▾</summary>

            <div style={menu}>
              {STAGES.map((s) => (
                <Link
                  key={s.id}
                  href={`/piyade/stages/${s.id}`}
                  style={menuItem}
                >
                  <span>{s.title}</span>
                  <span style={subText}>%{Math.round(s.weight * 100)}</span>
                </Link>
              ))}
            </div>
          </details>

          {/* ✅ Katılımcılar: sadece istediğin sayfada + login olmuşsa */}
          {showParticipantsLink && isAuthed ? (
            <Link href="/piyade/participants" style={btnGhost}>
              Katılımcılar
            </Link>
          ) : null}

          {/* ✅ Çıkış: sadece participants sayfasında + login olmuşsa */}
          {showLogout && isAuthed ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" style={btn}>
                Çıkış
              </button>
            </form>
          ) : null}
        </nav>
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
  textDecoration: "none",
  color: "#111827",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  background: "white",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
  cursor: "pointer",
  listStyle: "none",
};

const menu: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: 46,
  minWidth: 360,
  background: "white",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  zIndex: 50,
};

const menuItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 14px",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
  borderBottom: "1px solid #F3F4F6",
};

const subText: React.CSSProperties = {
  fontSize: 12,
  color: "#6B7280",
  fontWeight: 700,
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
