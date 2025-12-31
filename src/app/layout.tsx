import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});


export const metadata: Metadata = {
  title: "Miller Fourie | Portfolio",
  description:
    "Portfolio of Miller Fourie - interactive projects, experiments, and engineering notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} ${spaceGrotesk.variable} ${bebasNeue.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
