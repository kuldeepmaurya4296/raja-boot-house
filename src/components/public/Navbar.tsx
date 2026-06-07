"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { Logo } from "@/components/shared/Logo";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?cat=chelsea", label: "Chelsea" },
  { href: "/shop?cat=work", label: "Work" },
  { href: "/shop?cat=dress", label: "Dress" },
  { href: "/shop?cat=womens", label: "Women's" },
];

export function Navbar() {
  const { count } = useCart();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-border">
      <div className="hidden md:block bg-charcoal text-cream text-[11px] tracking-[0.18em] uppercase">
        <div className="container mx-auto px-6 py-2 text-center">
          Hand-stitched since 1972 · Free shipping over ₹2000 · 30-day returns
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo size={36} />
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
          {links.map((l) => {
            const active = path === l.href;
            return (
              <Link
                key={l.label}
                href={l.href}
                className={`text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider ${
                  active ? "text-primary font-semibold" : "text-foreground/80"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 hover:bg-muted rounded-full transition" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/account"
            className="hidden md:inline-flex p-2 hover:bg-muted rounded-full transition"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            href="/account/wishlist"
            className="hidden md:inline-flex p-2 hover:bg-muted rounded-full transition"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition" aria-label="Cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden border-t border-border bg-card"
          >
            <div className="flex flex-col p-4 gap-1">
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
