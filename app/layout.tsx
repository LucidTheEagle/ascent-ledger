import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter - Primary font for UI
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// JetBrains Mono - Monospace for code-like elements (ticker, data)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
  description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan. From unclear to unstoppable.",
  openGraph: {
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan.",
    url: "https://ascentledger.com",
    siteName: "Ascent Ledger",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}