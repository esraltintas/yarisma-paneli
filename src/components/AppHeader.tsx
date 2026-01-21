import Link from "next/link";
import { cookies } from "next/headers";
import AppHeaderClient from "./AppHeaderClient";
import { sessionCookieName, isAuthedCookie } from "@/lib/auth";

export default async function AppHeader({
  showLogout = false,
}: {
  showLogout?: boolean;
}) {
  const store = await cookies(); // Next 15/16: cookies() async dönebiliyor
  const cookie = store.get(sessionCookieName)?.value;
  const isAuthed = isAuthedCookie(cookie);

  return (
    <AppHeaderClient
      isAuthed={isAuthed}
      showLogout={showLogout}
      brandHref="/piyade/dashboard"
      brandTitle="Swat Challange Mülakat Paneli"
    />
  );
}
