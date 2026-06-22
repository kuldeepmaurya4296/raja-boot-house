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

const SearchModal = dynamic(() => import("./SearchModal").then((mod) => mod.SearchModal), {
  ssr: false,
});

const NavDrawer = dynamic(() => import("./NavDrawer").then((mod) => mod.NavDrawer), { ssr: false });

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
  const [announcements, setAnnouncements] = useState<string[]>([
    "Hand-stitched footwear",
    "Free shipping over ₹2000",
    "Official Lakhani · Paragon · Touch retailer",
  ]);
  const [announcementsActive, setAnnouncementsActive] = useState(true);

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

    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.list)) {
          setAnnouncements(data.list);
          setAnnouncementsActive(data.isActive);
        }
      })
      .catch((err) => console.error("Failed to load announcements", err));

    setMounted(true);
  }, []);

  const renderMarqueeItems = () => {
    return (
      <>
        {announcements.map((item, idx) => (
          <span key={`ann-${idx}`} className="flex items-center gap-2">
            <span className="opacity-75">✦</span> {item}
          </span>
        ))}
        {/* Developer Credit Watermark */}
        <span className="flex items-center gap-1.5 normal-case tracking-normal">
          <span className="opacity-75">✦</span> Designed &amp; Developed by{" "}
          <a
            href="https://kuldeep.maurya-tech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cognac hover:underline font-bold transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            Kuldeep Maurya
          </a>{" "}
          from{" "}
          <a
            href="https://maurya-tech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cognac hover:underline font-bold transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            Maurya Technologies
          </a>
        </span>
        {/* WhatsApp Click-to-Chat with prefilled message */}
        <span className="flex items-center gap-1.5 normal-case tracking-normal">
          <span className="opacity-75">✦</span>
          <a
            href="https://wa.me/916263638053?text=I%20got%20contact%20from%20rajaboothouse"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="h-3.5 w-3.5 fill-current shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.632 2.016 14.11 1.01 11.999 1.01c-5.432 0-9.855 4.37-9.86 9.8.001 1.77.475 3.5 1.374 5.02L2.501 21.5l5.9-1.516c-1.45-1.15-1.754-1.28-1.754-1.28zm10.748-6.195c-.29-.145-1.714-.847-1.98-.942-.265-.096-.458-.145-.65.145-.192.29-.747.942-.916 1.133-.169.19-.338.216-.628.072-.29-.145-1.226-.452-2.336-1.442-.864-.77-1.448-1.72-1.618-2.01-.168-.29-.018-.448.127-.592.13-.13.29-.338.434-.507.145-.17.193-.29.29-.483.096-.193.048-.361-.024-.506-.072-.145-.65-1.566-.89-2.146-.236-.566-.475-.49-.65-.498-.17-.008-.362-.01-.555-.01-.193 0-.506.072-.77.362-.266.29-1.013.99-1.013 2.416 0 1.42 1.037 2.793 1.18 2.987.145.193 2.04 3.114 4.94 4.368.69.298 1.23.476 1.65.61.693.22 1.325.19 1.822.115.556-.084 1.714-.7 1.956-1.374.24-.676.24-1.256.169-1.374-.07-.118-.264-.19-.554-.336z" />
            </svg>
            Contact WhatsApp
          </a>
        </span>
      </>
    );
  };

  const links = categoriesList.map((c) => ({
    href: `/shop?category=${c.slug}`,
    label: c.name.replace(" Footwear", ""),
  }));

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-cream/92 backdrop-blur-lg shadow-sm border-b border-border/60"
            : "bg-cream/85 backdrop-blur-md border-b border-border"
        }`}
      >
        {/* Announcement strip */}
        {announcementsActive && announcements.length > 0 && (
          <div className="relative overflow-hidden bg-charcoal text-cream text-[10px] tracking-[0.2em] uppercase py-2.5 flex w-full select-none border-b border-border/10">
            <div className="flex animate-marquee gap-16 whitespace-nowrap pr-16 hover:[animation-play-state:paused] cursor-pointer">
              {renderMarqueeItems()}
            </div>
            <div
              className="flex animate-marquee gap-16 whitespace-nowrap pr-16 hover:[animation-play-state:paused] cursor-pointer"
              aria-hidden="true"
            >
              {renderMarqueeItems()}
            </div>
          </div>
        )}

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
                ? path === l.href.split("?")[0] &&
                  searchParams.get("category") ===
                    new URLSearchParams(l.href.split("?")[1]).get("category")
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
                  <span>
                    {session.user?.name
                      ? session.user.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .slice(0, 2)
                      : "U"}
                  </span>
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
          <SearchModal onClose={() => setSearchOpen(false)} categoriesList={categoriesList} />
        )}
      </AnimatePresence>
    </>
  );
}
