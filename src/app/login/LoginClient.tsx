"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setErr("Kullanıcı adı / şifre hatalı.");
        return;
      }

      router.replace(nextPath);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
      <div
        style={{
          maxWidth: 420,
          margin: "120px auto",
          border: "1px solid #E5E7EB",
          borderRadius: 16,
          padding: 22,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Giriş</h1>
        <p
          style={{
            marginTop: 6,
            marginBottom: 18,
            color: "#6B7280",
            fontWeight: 700,
          }}
        >
          Katılımcılara erişmek için giriş yap.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Kullanıcı adı"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              fontSize: 16,
            }}
          />
          <input
            placeholder="Şifre"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              fontSize: 16,
            }}
          />

          {err && (
            <div style={{ color: "#B42318", fontWeight: 800, fontSize: 14 }}>
              {err}
            </div>
          )}

          <button
            disabled={loading}
            style={{
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #111827",
              background: "#111827",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
