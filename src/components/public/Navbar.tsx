"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { Logo } from "@/components/shared/Logo";
import { categories as fallbackCategories } from "@/data/categories";
import { formatINR } from "@/lib/format";
import { useSession } from "next-auth/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";

const SearchModal = dynamic(
  () => import("./SearchModal").then((mod) => mod.SearchModal),
  { ssr: false }
);

const NavDrawer = dynamic(
  () => import("./NavDrawer").then((mod) => mod.NavDrawer),
  { ssr: false }
);

export function Navbar() {
  const { count } = useCart();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "customer";
  const accountLink = role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : "/account";
  const path = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for enhanced header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  // Dynamic categories
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        } else {
          setCategoriesList(fallbackCategories);
        }
      })
      .catch(() => {
        setCategoriesList(fallbackCategories);
      });

    setMounted(true);
  }, []);

  const links = categoriesList.map((c) => ({
    href: `/shop?category=${c.slug}`,
    label: c.name.replace(" Footwear", ""),
  }));

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-cream/92 backdrop-blur-lg shadow-sm border-b border-border/60"
          : "bg-cream/85 backdrop-blur-md border-b border-border"
      }`}>
        {/* Announcement strip */}
        <div className="hidden md:block bg-charcoal text-cream text-[10px] tracking-[0.2em] uppercase">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center">
            <span className="opacity-75">✦</span>
            {" "}Hand-stitched footwear · Free shipping over ₹2000 · Official Lakhani · Paragon · Touch retailer{" "}
            <span className="opacity-75">✦</span>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 -ml-2 hover:bg-muted rounded-xl transition cursor-pointer"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo size={36} />

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/shop"
              className={`text-xs font-bold hover:text-primary transition-colors uppercase tracking-[0.15em] pb-0.5 border-b-2 ${
                path === "/shop" && !searchParams.get("category")
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/75 hover:border-primary/40"
              }`}
            >
              Shop All
            </Link>
            {links.map((l) => {
              const active = l.href.includes("?")
                ? path === l.href.split("?")[0] && searchParams.get("category") === new URLSearchParams(l.href.split("?")[1]).get("category")
                : path === l.href;
              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className={`text-xs font-bold hover:text-primary transition-colors uppercase tracking-[0.15em] pb-0.5 border-b-2 ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground/75 hover:border-primary/40"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Icon Actions Bar */}
          <div className="flex items-center gap-0.5 md:gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 hover:bg-muted rounded-xl transition-all cursor-pointer group"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
            </button>

            {/* Wishlist — desktop only */}
            <Link
              href="/account/wishlist"
              className="hidden md:flex p-2.5 hover:bg-muted rounded-xl transition-all group"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
            </Link>

            {/* Cart with badge */}
            <Link
              href="/cart"
              className="relative p-2.5 hover:bg-muted rounded-xl transition-all group"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5 text-foreground/70 group-hover:text-primary transition-colors" />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cognac text-cream text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* User / Sign In */}
            {session ? (
              <Link
                href={accountLink}
                className="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold uppercase shadow-sm shrink-0 transition-all overflow-hidden"
                title={`Account: ${session.user?.name || "User"}`}
              >
                {!avatarError && session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="h-full w-full rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span>{session.user?.name ? session.user.name.split(" ").map((n: any) => n[0]).join("").slice(0, 2) : "U"}</span>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 border border-border/60 rounded-full hover:bg-muted text-xs font-bold tracking-wide uppercase transition-all ml-1"
              >
                <User className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <NavDrawer
            onClose={() => setMenuOpen(false)}
            categoriesList={categoriesList}
            session={session}
            accountLink={accountLink}
          />
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <SearchModal
            onClose={() => setSearchOpen(false)}
            categoriesList={categoriesList}
          />
        )}
      </AnimatePresence>
    </>
  );
}

