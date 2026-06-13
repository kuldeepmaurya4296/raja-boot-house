"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { useTheme } from "@/components/public/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="bg-charcoal text-cream/90 mt-12 md:mt-16 lg:mt-24 pb-20 md:pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
        <div className="col-span-2 md:col-span-2">
          <Logo size={44} />
          <p className="mt-4 text-sm text-cream/60 max-w-xs">Footwear retail brand established in 2025 by the Gupta brothers. Offering a wide range of footwear from reputed brands like Lakhani, Touch, Paragon, and Goldstar for all age groups.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">All Boots</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Chelsea</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Work</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Women's</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Our story</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Atelier</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Press</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Careers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Help</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Shipping</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Returns</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Sizing</Link></li>
            <li><Link href="/shop" className="hover:text-cream transition hover:underline">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-cream/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <span>© 2025–2026 Raja Boot House. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span>Made By Kuldeep Maurya</span>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-cream/20 hover:border-cream/40 text-cream/70 hover:text-cream transition cursor-pointer text-[10px] uppercase font-bold tracking-wider"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-brass" />
                <span>Dark Theme</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
