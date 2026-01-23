// src/app/login/page.tsx
import LoginClient from "./LoginClient";

type SP = { next?: string | string[] };

export default async function Page({
  searchParams,
}: {
  // Next 16'da bazen Promise geliyor, o yüzden ikisini de karşılıyoruz
  searchParams: Promise<SP> | SP;
}) {
  const sp = await searchParams;
  const nextRaw = sp?.next;

  const next =
    typeof nextRaw === "string" && nextRaw.trim()
      ? nextRaw
      : "/piyade/dashboard";

  return <LoginClient nextPath={next} />;
}
