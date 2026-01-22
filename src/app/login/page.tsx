// src/app/login/page.tsx
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: Props) {
  const next =
    typeof searchParams?.next === "string" && searchParams.next.trim()
      ? searchParams.next
      : "/piyade/dashboard";

  return <LoginClient next={next} />;
}
