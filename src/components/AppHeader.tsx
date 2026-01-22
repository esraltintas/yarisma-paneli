// src/components/AppHeader.tsx
import AppHeaderClient from "@/components/AppHeaderClient";
import { isAuthed } from "@/lib/auth-server";

type Mode = "piyade" | "keskin";

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
  brandTitle = "Swat Challange Mülakat Paneli",
}: Props) {
  const authed = await isAuthed();

  const brandHref =
    mode === "keskin" ? "/keskin/dashboard" : "/piyade/dashboard";

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
