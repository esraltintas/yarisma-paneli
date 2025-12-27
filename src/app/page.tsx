import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <div style={{ display: "flex", gap: 16 }}>
        <Link href="/piyade/dashboard" style={card}>
          Piyade
        </Link>

        <Link href="/keskin/dashboard" style={card}>
          Keskin
        </Link>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  flex: 1,
  padding: 20,
  borderRadius: 12,
  border: "1px solid #E5E7EB",
  textDecoration: "none",
  color: "#111827",
  fontWeight: 800,
};
