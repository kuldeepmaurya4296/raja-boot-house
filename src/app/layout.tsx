import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Watermark } from "@/components/shared/Watermark";
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
  metadataBase: new URL("https://rbh.maurya-tech.com"),
  title: {
    default: "Raja Boot House — Leather Boots & Premium Footwear",
    template: "%s | Raja Boot House",
  },
  description:
    "Footwear retail brand. Offers a wide range of premium footwear for men, women, and children from Lakhani, Touch, Paragon, Goldstar, and more.",
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
    url: "https://rbh.maurya-tech.com",
    siteName: "Raja Boot House",
    images: [
      {
        url: "/assets/hero-boots.jpg",
        width: 1200,
        height: 630,
        alt: "Raja Boot House  Footwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raja Boot House",
    description: "Luxury footwear and premium Indian leather craftsmanship.",
    images: ["/assets/hero-boots.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Set theme before first paint to avoid a flash of the wrong theme.
            Mirrors ThemeProvider: saved `rbh-theme` wins, else system preference.
            beforeInteractive runs before hydration (Next hoists it into <head>). */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('rbh-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`}
        </Script>
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
          <Watermark />
        </Providers>
      </body>
    </html>
  );
}
