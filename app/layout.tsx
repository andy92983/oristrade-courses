import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { SidebarLayout } from "../components/layout/SidebarLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "OrisTrade — Where Precision Meets Profit",
  description:
    "Multi-layer confluence trading signals combining order flow, technicals, macro, sentiment, and AI. Master the markets with OrisTrade.",
  keywords: [
    "trading signals", "options flow", "dark pool", "forex trading",
    "futures trading", "options selling", "scalping", "trading education",
  ],
  openGraph: {
    title: "OrisTrade — Where Precision Meets Profit",
    description: "The only platform combining 12 layers of market intelligence into clear, actionable trading signals.",
    url: "https://oristrade.com",
    siteName: "OrisTrade",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrisTrade — Where Precision Meets Profit",
    description: "12-layer confluence trading intelligence. Forex. Futures. Options. Stocks. Crypto.",
    images: ["/brand/og-image.png"],
  },
  robots: { index: true, follow: true },
  themeColor: "#0A0E1A",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico",       sizes: "any" },
    ],
    apple:   { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-brand-bg text-brand-text font-sans antialiased">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
