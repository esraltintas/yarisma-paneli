import AppHeader from "@/components/AppHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        {children}
      </main>
    </>
  );
}
