import Link from "next/link";

export default function AppHeader() {
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

        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/participants">Katılımcılar</Link>
          <Link href="/stages/etap-1">Etap 1</Link>
          <Link href="/stages/etap-2">Etap 2</Link>
        </nav>
      </div>
    </header>
  );
}
