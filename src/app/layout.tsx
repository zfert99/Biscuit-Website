import type { Metadata } from "next";
import { Fredoka, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font — no external requests, no layout shift.
// See Docs/design/design-system.md §2.
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

// Space Mono is not a variable font, so a weight is required.
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://biscuitlab.net"),
  title: {
    default: "Biscuit Lab",
    template: "%s · Biscuit Lab",
  },
  description: "A small lab: the projects, and the build log behind them.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${manrope.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
