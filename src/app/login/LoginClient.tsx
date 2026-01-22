"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  next: string;
};

export default function LoginClient({ next }: Props) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setErr("Kullanıcı adı veya şifre hatalı.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setErr("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
      <div style={{ display: "grid", placeItems: "center", minHeight: "70vh" }}>
        <div
          style={{
            width: 520,
            maxWidth: "100%",
            border: "1px solid #E5E7EB",
            borderRadius: 18,
            padding: 24,
            background: "white",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Giriş</h1>
          <p style={{ marginTop: 8, color: "#6B7280", fontWeight: 700 }}>
            Panele erişmek için kullanıcı adı ve şifre gir.
          </p>

          <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
            <input
              placeholder="Kullanıcı adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={input}
              autoComplete="username"
            />

            <div style={{ height: 10 }} />

            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={input}
              autoComplete="current-password"
            />

            {err && (
              <div style={{ marginTop: 10, color: "#D92D20", fontWeight: 800 }}>
                {err}
              </div>
            )}

            <button disabled={loading} style={btn}>
              {loading ? "..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  fontSize: 16,
  outline: "none",
};

const btn: React.CSSProperties = {
  width: "100%",
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
