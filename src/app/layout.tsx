import type { Metadata } from "next";
import { Press_Start_2P, Inter, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font — no external network requests
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BiscuittArcade — Developer Portfolio",
  description:
    "The retro arcade portfolio of BiscuittArcade — a web developer portfolio styled as a nostalgic Flash game portal. Explore case studies, interactive projects, and contact info.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${inter.variable} ${shareTechMono.variable} h-full`}
    >
      <body className="scanlines min-h-full">
        {children}
      </body>
    </html>
  );
}
