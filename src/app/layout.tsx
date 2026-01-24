import type { Metadata } from "next";
import "./globals.css";

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
      <body className="ata-bg">
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
