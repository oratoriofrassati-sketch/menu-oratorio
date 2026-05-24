import type { Metadata } from "next";
import { Love_Ya_Like_A_Sister } from "next/font/google";

import "./globals.css";

const loveYaLikeASister = Love_Ya_Like_A_Sister({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-love",
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
      <body className={loveYaLikeASister.variable}>
        {children}
      </body>
    </html>
  );
}