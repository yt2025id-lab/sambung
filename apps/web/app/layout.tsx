/* eslint-disable */
import type { Metadata } from "next";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Sambung — Kirim Uang ke Indonesia",
  description: "Kirim uang ke Indonesia dengan USDC via Stellar, sampai ke QRIS",
};
