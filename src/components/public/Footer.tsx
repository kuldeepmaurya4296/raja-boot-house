"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useTheme } from "@/components/public/ThemeProvider";
import { Sun, Moon, MapPin, Phone, Mail, Shield } from "lucide-react";

const shopLinks = [
  { label: "All Footwear", href: "/shop" },
  { label: "Men's Collection", href: "/shop?category=mens" },
  { label: "Women's Collection", href: "/shop?category=womens" },
  { label: "Bridal & Wedding", href: "/shop?category=bridal" },
  { label: "Sports & Athletic", href: "/shop?category=sports" },
  { label: "Kids' Footwear", href: "/shop?category=kids" },
];

const customerLinks = [
  { label: "Your Account", href: "/account" },
  { label: "Track Orders", href: "/account/orders" },
  { label: "Your Wishlist", href: "/account/wishlist" },
  { label: "Shopping Bag", href: "/cart" },
  { label: "Register / Login", href: "/login" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Shipping & Delivery", href: "/delivery-policy" },
  { label: "Return & Refund Policy", href: "/refund-policy" },
];

export function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="bg-cream dark:bg-charcoal text-charcoal dark:text-cream/90 border-t border-border/50 mt-12 md:mt-16 lg:mt-24">


      {/* Main Links Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
        <div className="md:col-span-2">
          <Logo size={44} />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
            Premium footwear retail offering hand-crafted leather shoes, bridal juttis, sandals, and athletic footwear for every generation.
          </p>
          {/* Payment badges */}
          <div className="mt-6">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2.5">Secure Payments Via</p>
            <div className="flex flex-wrap gap-2">
              {["UPI", "Razorpay", "Visa", "Mastercard", "COD"].map(badge => (
                <span
                  key={badge}
                  className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-cream/40 dark:bg-cream/5 border border-border/60 dark:border-cream/15 rounded text-muted-foreground dark:text-cream/60"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold mb-4 uppercase tracking-[0.2em] text-cognac">Shop Collection</h4>
          <ul className="space-y-2.5">
            {shopLinks.map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-charcoal dark:hover:text-cream transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold mb-4 uppercase tracking-[0.2em] text-cognac">Customer Service</h4>
          <ul className="space-y-2.5">
            {customerLinks.map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-charcoal dark:hover:text-cream transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold mb-4 uppercase tracking-[0.2em] text-cognac">Legal &amp; Policy</h4>
          <ul className="space-y-2.5">
            {legalLinks.map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-charcoal dark:hover:text-cream transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40 pb-20 md:pb-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs text-muted-foreground/80 text-center sm:text-left">
            <span>© 2025–2026 Raja Boot House. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span>Designed &amp; Built by Kuldeep Maurya</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
              <Shield className="h-3 w-3 text-cognac/80" />
              <span>256-bit SSL Secured</span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/80 dark:border-cream/20 hover:border-charcoal/40 dark:hover:border-cream/40 text-muted-foreground dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition cursor-pointer text-[10px] uppercase font-bold tracking-wider"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-cognac" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
