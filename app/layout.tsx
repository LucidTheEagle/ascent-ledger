import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavigationWrapper } from "@/components/wrapper/NavigationWrapper";
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import OfflineDetector from '@/components/shared/OfflineDetector';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 
    process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
  ),
  
  title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
  description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan. From unclear to unstoppable.",
  keywords: [
    "career mentorship",
    "AI career coach",
    "career clarity",
    "professional development",
    "career planning",
    "strategic career growth",
    "executive coaching",
    "career transition",
  ],
  authors: [{ name: "Ascent Ledger Team" }],
  creator: "Ascent Ledger",
  publisher: "Ascent Ledger",
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ascentledger.com",
    siteName: "Ascent Ledger",
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Ascent Ledger turns your fog into a flight plan.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ascent Ledger - AI Mentorship OS",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@ascentledger",
    creator: "@ascentledger",
    title: "Ascent Ledger | AI Mentorship OS for Career Clarity",
    description: "Stop mistaking motion for progress. Turn your fog into a flight plan.",
    images: ["/twitter-image.jpg"],
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Robots
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Ascent Ledger",
              applicationCategory: "BusinessApplication",
              description: "AI mentorship OS for career clarity and strategic professional growth",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "87",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <OfflineDetector />
          <NavigationWrapper />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}