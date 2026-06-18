import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rajaboothouse.com"),
  title: {
    default: "Raja Boot House — Handcrafted Leather Boots & Premium Footwear",
    template: "%s | Raja Boot House"
  },
  description: "Footwear retail brand. Offers a wide range of premium footwear for men, women, and children from Lakhani, Touch, Paragon, Goldstar, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Raja Boot House",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://rajaboothouse.com",
    siteName: "Raja Boot House",
    images: [
      {
        url: "/assets/hero-boots.jpg",
        width: 1200,
        height: 630,
        alt: "Raja Boot House Handcrafted Footwear"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Raja Boot House",
    description: "Handcrafted luxury footwear and premium Indian leather craftsmanship.",
    images: ["/assets/hero-boots.jpg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}


