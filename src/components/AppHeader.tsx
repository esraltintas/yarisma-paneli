// src/components/AppHeader.tsx
import AppHeaderClient from "@/components/AppHeaderClient";
import { isAuthed } from "@/lib/auth-server";

export type Mode = "piyade";

type Props = {
  mode?: Mode;

  // Etaplar her yerde görünsün (default zaten true)
  showStages?: boolean;

  // Katılımcılar linki sadece admin layout’ta istenirse ve authed ise görünsün
  showParticipantsLink?: boolean;

  // Çıkış sadece admin layout’ta istenirse ve authed ise görünsün
  showLogout?: boolean;

  brandTitle?: string;
};

export default async function AppHeader({
  mode = "piyade",
  showStages = true,
  showParticipantsLink = false,
  showLogout = false,
  brandTitle = "Anasayfa",
}: Props) {
  const authed = await isAuthed();

  const brandHref = "/piyade/dashboard";

  return (
    <AppHeaderClient
      mode={mode}
      isAuthed={authed}
      showStages={showStages}
      showParticipantsLink={showParticipantsLink}
      showLogout={showLogout}
      brandHref={brandHref}
      brandTitle={brandTitle}
    />
  );
}
