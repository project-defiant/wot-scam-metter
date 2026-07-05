import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WOT Scam Meter",
  description: "Upload and crowd-assess World of Tanks replay cases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
