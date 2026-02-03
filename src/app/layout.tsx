import type { Metadata } from "next";
import Script from "next/script";
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

        {/* 📊 Umami Analytics */}
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="a4de69d2-e66d-43df-b098-69587d3db965"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
