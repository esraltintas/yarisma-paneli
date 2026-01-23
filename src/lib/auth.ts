// src/lib/auth.ts
// Edge-friendly (Node crypto yok)

export const sessionCookieName = "swat_session";

// Bu değer cookie içine yazılacak "token".
// Şimdilik basit tutuyoruz. İstersen env'den de alırız.
export function sessionCookieValue() {
  return "ok";
}

// Cookie doğrulama (async kaldıysa proxy await istiyor diye async yaptım)
export async function isAuthedCookie(cookieValue: string | undefined | null) {
  return cookieValue === sessionCookieValue();
}

export function getAdminUsername() {
  const u = process.env.AUTH_USERNAME;
  if (!u) throw new Error("AUTH_USERNAME is missing");
  return u;
}

export function getAdminPassword() {
  const p = process.env.AUTH_PASSWORD;
  if (!p) throw new Error("AUTH_PASSWORD is missing");
  return p;
}
