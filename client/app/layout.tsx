import type { Metadata } from "next";
import "./globals.css";
import { satoshi } from "./fonts";
import NextTopLoader from 'nextjs-toploader';

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
      <body>{children}
        <NextTopLoader color="#EC003F" showSpinner={false} height={3} />
      </body>
    </html>
  );
}