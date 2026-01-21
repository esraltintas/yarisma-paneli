import DashboardClient from "@/components/DashboardClient";

export default function Page() {
  return (
    <div style={{ maxWidth: 1200, margin: "18px auto", padding: "0 18px" }}>
      <DashboardClient mode="piyade" />
    </div>
  );
}
