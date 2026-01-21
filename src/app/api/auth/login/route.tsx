"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        cache: "no-store",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || "Giriş başarısız");
        return;
      }

      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Giriş</h1>
        <p style={{ marginTop: 6, color: "#6B7280" }}>
          Panele erişmek için kullanıcı adı ve şifre gir.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adı"
            style={input}
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre"
            style={input}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading} style={btn}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          {error ? <div style={errorStyle}>{error}</div> : null}
        </form>
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "70vh",
  display: "grid",
  placeItems: "center",
  padding: 16,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  border: "1px solid #E5E7EB",
  borderRadius: 16,
  padding: 18,
  background: "white",
};

const input: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
};

const btn: React.CSSProperties = {
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  borderRadius: 12,
  padding: "12px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  marginTop: 6,
  color: "#B91C1C",
  fontWeight: 700,
};
