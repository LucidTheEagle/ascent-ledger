import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { StructuredData } from "@/components/seo/StructuredData";
import "./globals.css";

// Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Enhanced SEO Metadata
export const metadata: Metadata = {
  title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
  description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan. From unclear to unstoppable.",
  keywords: ["career clarity", "AI mentorship", "productivity OS", "career growth", "strategic execution"],
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ascentledger.com",
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan.",
    siteName: "Ascent Ledger",
    images: [
      {
        url: "https://ascentledger.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ascent Ledger - AI Mentorship OS Dashboard",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan.",
    creator: "@ascentledger",
    images: ["https://ascentledger.com/twitter-image.jpg"],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  
  alternates: {
    canonical: "https://ascentledger.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <StructuredData />
      </head>
      <body className="antialiased bg-ascent-black text-ascent-white">
        {children}
      </body>
    </html>
  );
}