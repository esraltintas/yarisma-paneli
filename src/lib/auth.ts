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

// Login şifresi (env'den okunur). Yoksa fallback: "1234"
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "1234";
}
