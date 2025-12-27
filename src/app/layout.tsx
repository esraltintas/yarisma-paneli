import type { Metadata } from "next";
import "./globals.css";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Yarışma Paneli",
  description: "Etap bazlı yarışma ve puanlama sistemi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <AppHeader />
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
