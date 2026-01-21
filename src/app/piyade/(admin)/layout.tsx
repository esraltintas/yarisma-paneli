import AppHeader from "@/components/AppHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader showLogout />
      <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
        {children}
      </div>
    </>
  );
}
