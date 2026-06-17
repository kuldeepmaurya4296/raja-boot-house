"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Menu, X, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-store";
import { Logo } from "@/components/shared/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { categories as fallbackCategories } from "@/data/categories";
import { formatINR } from "@/lib/format";
import { useSession } from "next-auth/react";

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
  const [drawerAvatarError, setDrawerAvatarError] = useState(false);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, searchResults]);

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

    try {
      const stored = localStorage.getItem("rbh-recent-searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const delay = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setSearchResults(data);
          }
        })
        .catch((err) => console.error("Search failed:", err))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSearchSubmit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("rbh-recent-searches", JSON.stringify(updated));
    } catch { }

    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalNavigable = matchedBrands.length + Math.min(searchResults.length, 6);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < totalNavigable - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < totalNavigable) {
        e.preventDefault();
        if (focusedIndex < matchedBrands.length) {
          const brand = matchedBrands[focusedIndex];
          setSearchOpen(false);
          setSearchQuery("");
          router.push(`/shop?brand=${encodeURIComponent(brand)}`);
        } else {
          const prodIdx = focusedIndex - matchedBrands.length;
          const product = searchResults.slice(0, 6)[prodIdx];
          setSearchOpen(false);
          setSearchQuery("");
          router.push(`/shop/${product.slug}`);
        }
      } else {
        handleSearchSubmit(searchQuery);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSearchOpen(false);
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [searchOpen]);

  const links = categoriesList.map((c) => ({
    href: `/shop?category=${c.slug}`,
    label: c.name.replace(" Footwear", ""),
  }));

  const matchedBrands = Array.from(
    new Set(
      searchResults
        .map((p) => p.brand)
        .filter(Boolean)
    )
  ).slice(0, 3);

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
                  <img
                    src={session.user.image}
                    alt=""
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-charcoal z-40 backdrop-blur-xs"
            />

            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="md:hidden fixed top-0 left-0 bottom-0 h-full w-[72vw] max-w-[290px] bg-card border-r border-border shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <Logo size={32} />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-xl transition"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1 flex-grow p-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold px-3 mb-1">Shop by Category</p>
                <Link
                  href="/shop"
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                    path === "/shop" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                  }`}
                >
                  All Footwear
                </Link>
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted text-foreground/75 hover:text-foreground uppercase tracking-wider transition-all"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-border p-4 mt-auto">
                {session ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-2xl border border-border/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shadow-sm shrink-0 border border-primary/15 overflow-hidden">
                      {!drawerAvatarError && session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                          onError={() => setDrawerAvatarError(true)}
                        />
                      ) : (
                        session.user?.name ? session.user.name.split(" ").map((n: any) => n[0]).join("").slice(0, 2) : "U"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{session.user?.name || "Member"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href={accountLink}
                      onClick={() => setMenuOpen(false)}
                      className="p-1.5 bg-card hover:bg-muted rounded-lg border border-border text-xs font-bold text-primary transition shrink-0"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-full text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-95 transition"
                  >
                    <User className="h-3.5 w-3.5" />
                    Sign In to Your Account
                  </Link>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-charcoal/55 backdrop-blur-sm"
            />

            <div className="flex min-h-full items-start justify-center p-4 pt-16 md:pt-24">
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card border border-border/80 shadow-2xl flex flex-col gap-0 relative"
              >
                {/* Search Input Bar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for footwear, brands, or categories..."
                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-1 hover:bg-muted rounded-lg transition"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1 hover:bg-muted rounded-lg transition"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted px-2 py-1 rounded">ESC</span>
                  </button>
                </div>

                {/* Results Body */}
                <div className="overflow-y-auto max-h-[420px] p-4 space-y-5">
                  {searching && (
                    <div className="py-10 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mx-auto mb-3"></div>
                      <p className="text-sm text-muted-foreground font-medium">Searching catalog...</p>
                    </div>
                  )}

                  {!searching && !searchQuery.trim() && (
                    <>
                      {recentSearches.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2.5">
                            Recent Searches
                          </h4>
                          <div className="space-y-1">
                            {recentSearches.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleSearchSubmit(s)}
                                className="flex items-center gap-2.5 text-sm text-foreground/70 hover:text-primary py-1.5 w-full text-left hover:bg-muted px-2 rounded-lg transition-all"
                              >
                                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span>{s}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2.5">
                          Browse Categories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {categoriesList.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSearchOpen(false);
                                router.push(`/shop?category=${c.slug}`);
                              }}
                              className="px-3.5 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30 rounded-full text-xs font-semibold text-foreground/70 transition-all"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {!searching && searchQuery.trim() && searchResults.length === 0 && (
                    <div className="py-12 text-center">
                      <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-muted-foreground">No matches for "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Try a brand name like "Lakhani" or category like "bridal"</p>
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <>
                      {matchedBrands.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2.5">
                            Brands
                          </h4>
                          <div className="flex gap-2">
                            {matchedBrands.map((b, idx) => {
                              const isFocused = focusedIndex === idx;
                              return (
                                <button
                                  key={b}
                                  onClick={() => {
                                    setSearchOpen(false);
                                    setSearchQuery("");
                                    router.push(`/shop?brand=${encodeURIComponent(b)}`);
                                  }}
                                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border cursor-pointer ${
                                    isFocused
                                      ? "bg-brass/20 border-brass/40 text-cognac ring-2 ring-primary/20"
                                      : "bg-brass/10 border-brass/20 text-cognac hover:bg-brass/20"
                                  }`}
                                >
                                  {b}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold mb-2.5">
                          Products ({searchResults.length})
                        </h4>
                        <div className="space-y-1">
                          {searchResults.slice(0, 6).map((p, idx) => {
                            const isFocused = focusedIndex === matchedBrands.length + idx;
                            return (
                              <Link
                                key={p.id}
                                href={`/shop/${p.slug}`}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className={`flex items-center gap-3.5 group p-2 rounded-xl transition-all ${
                                  isFocused ? "bg-muted ring-1 ring-border/60" : "hover:bg-muted/60"
                                }`}
                              >
                                <img
                                  src={p.image}
                                  alt=""
                                  className="h-12 w-12 rounded-lg object-cover border border-border/60 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {p.brand} · {formatINR(p.price)}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0" />
                              </Link>
                            );
                          })}
                        </div>
                        {searchResults.length > 6 && (
                          <button
                            onClick={() => handleSearchSubmit(searchQuery)}
                            className="mt-3 w-full py-2 text-xs font-bold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
                          >
                            View all {searchResults.length} results for "{searchQuery}"
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
