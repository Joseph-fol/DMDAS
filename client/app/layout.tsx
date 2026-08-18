import type { Metadata } from "next";
import "./globals.css";
import { satoshi } from "./fonts";

export const metadata: Metadata = {
  title: "DMDAS",
  description: "Digital Manuals Distribution and Accountability System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={satoshi.className}>
      <body>{children}</body>
    </html>
  );
}