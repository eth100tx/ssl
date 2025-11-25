import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSL Inc. - Showtime Sound & Lighting",
  description: "Business management system for Showtime Sound & Lighting Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
