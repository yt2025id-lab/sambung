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
      <body className="min-h-screen bg-[#0a0a0b] antialiased">
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Sambung — QR rail on Stellar",
  description: "Kirim USDC QRIS ke Indonesia. QR rail on Stellar — kirim dari mana saja, sampai ke QRIS tujuan.",
};
