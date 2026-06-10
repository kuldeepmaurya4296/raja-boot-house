import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rajaboothouse.com"),
  title: {
    default: "Raja Boot House — Handcrafted Leather Boots & Premium Footwear",
    template: "%s | Raja Boot House"
  },
  description: "Footwear retail brand established since 1972. Offers a wide range of premium footwear for men, women, and children from Lakhani, Touch, Paragon, Goldstar, and more.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Raja Boot House",
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
    description: "Handcrafted luxury footwear and premium Indian leather craftsmanship since 1972.",
    images: ["/assets/hero-boots.jpg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,700;9..144,900&family=Inter:wght@300;400;500;600;700&display=swap" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}

