import type { Metadata } from "next";
import { Caveat_Brush } from "next/font/google";

import "./globals.css";

const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Frassati Fast Food",
  description: "Menu Fast Food Oratorio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={caveatBrush.variable}>
        {children}
      </body>
    </html>
  );
}