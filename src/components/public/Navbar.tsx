"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Menu, X, Clock, ArrowRight } from "lucide-react";
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

  // Hide mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
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

  // Reset keyboard focus when query or search results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery, searchResults]);

  // Load categories and recent searches
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

  // Debounced search query
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

  // Handle Search Input submit
  const handleSearchSubmit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    // Save to recent searches
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

  // Focus input on search modal open
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

  // Determine top links
  const links = categoriesList.map((c) => ({
    href: `/shop?category=${c.slug}`,
    label: c.name.replace(" Footwear", ""),
  }));

  // Unique brands matching the query
  const matchedBrands = Array.from(
    new Set(
      searchResults
        .map((p) => p.brand)
        .filter(Boolean)
    )
  ).slice(0, 3);

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-border">
        {/* Top banner strip */}
        <div className="hidden md:block bg-charcoal text-cream text-[11px] tracking-[0.18em] uppercase">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center">
            Hand-stitched footwear · Free shipping over ₹2000 · Gupta Brothers Craftsmanship
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo size={36} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
            <Link
              href="/shop"
              className={`text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider ${path === "/shop" ? "text-primary font-semibold" : "text-foreground/80"
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
                  className={`text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider ${active ? "text-primary font-semibold" : "text-foreground/80"
                    }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Icons Bar */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 hover:bg-muted rounded-full transition cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/account/wishlist"
              className="hidden md:inline-flex p-2 hover:bg-muted rounded-full transition"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full transition" aria-label="Cart">
              <ShoppingBag className="h-5 w-5 text-charcoal hover:text-primary transition-colors" />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-cognac text-cream text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {count}
                </span>
              )}
            </Link>

            {/* Profile Avatar shown on all screen sizes if logged in, otherwise Sign In button for desktop */}
            {session ? (
              <Link
                href={accountLink}
                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-cognac text-cream hover:bg-cognac/90 transition text-xs font-semibold uppercase shadow-sm border border-border shrink-0 ml-1"
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
                className="hidden md:inline-flex items-center justify-center px-4 py-1.5 border border-charcoal/20 rounded-full hover:bg-muted text-xs font-semibold tracking-wide uppercase transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

      </header>

      {/* Mobile Navigation Drawer (Moved outside header to prevent backdrop-filter containing block clipping) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-charcoal/45 z-40 backdrop-blur-xs"
            />

            {/* Side Drawer Menu */}
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="md:hidden fixed top-0 left-0 bottom-0 h-full w-[70vw] max-w-[280px] bg-card border-r border-border shadow-2xl z-50 flex flex-col p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                {/* <span className="font-serif font-bold text-sm tracking-tight text-foreground">
                  Navigation
                </span> */}
                <Logo size={36} />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 hover:bg-muted rounded-full transition"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-2 flex-grow">
                <Link
                  href="/shop"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted text-foreground transition-colors uppercase tracking-wider"
                >
                  Shop All
                </Link>
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted text-foreground/80 hover:text-foreground transition-colors uppercase tracking-wider"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-border pt-6 mt-auto flex flex-col gap-4">
                {session ? (
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-cognac text-cream flex items-center justify-center font-semibold text-sm uppercase shadow-sm shrink-0">
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
                      <p className="text-xs font-semibold text-foreground truncate">{session.user?.name || "Member"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                    <Link
                      href={accountLink}
                      onClick={() => setMenuOpen(false)}
                      className="p-1.5 bg-card hover:bg-muted rounded-lg border border-border text-xs font-bold text-primary transition shrink-0"
                    >
                      Go
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-full text-center text-xs font-bold uppercase tracking-wider shadow-sm hover:opacity-95 transition"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Global Autocomplete Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-charcoal/45 backdrop-blur-sm"
            />

            {/* Dialog Panel */}
            <div className="flex min-h-full items-start justify-center p-4 pt-16 md:pt-28">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-cream border border-border p-6 shadow-elevated transition-all flex flex-col gap-4 relative"
              >
                {/* Header Input bar */}
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by product name, brand, or category..."
                    className="flex-1 bg-transparent border-none outline-none text-base text-charcoal placeholder-muted-foreground"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1 hover:bg-muted rounded-full transition"
                  >
                    <X className="h-4.5 w-4.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Suggestions Body */}
                <div className="overflow-y-auto max-h-[400px] space-y-5">
                  {searching && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary mx-auto mb-2"></div>
                      Searching catalog...
                    </div>
                  )}

                  {!searching && !searchQuery.trim() && (
                    <>
                      {/* Recent searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                            Recent Searches
                          </h4>
                          <div className="space-y-1.5">
                            {recentSearches.map((s) => (
                              <button
                                key={s}
                                onClick={() => handleSearchSubmit(s)}
                                className="flex items-center gap-2.5 text-sm text-charcoal hover:text-primary py-1 w-full text-left"
                              >
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{s}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Style category suggestions */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                          Popular Styles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {categoriesList.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setSearchOpen(false);
                                router.push(`/shop?category=${c.slug}`);
                              }}
                              className="px-3 py-1.5 bg-muted hover:bg-secondary border border-border rounded-full text-xs font-medium text-charcoal transition"
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {!searching && searchQuery.trim() && searchResults.length === 0 && (
                    <div className="py-10 text-center">
                      <p className="text-sm text-muted-foreground">No matches found for "{searchQuery}"</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Try checking spelling or typing a general category like "shoes"</p>
                    </div>
                  )}

                  {!searching && searchResults.length > 0 && (
                    <>
                      {/* Matched Brands */}
                      {matchedBrands.length > 0 && (
                        <div>
                          <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                            Suggested Brands
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
                                  className={`px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                                    isFocused
                                      ? "bg-brass/25 border-brass/50 text-cognac ring-2 ring-primary"
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

                      {/* Matched Products */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                          Matched Products ({searchResults.length})
                        </h4>
                        <div className="space-y-3">
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
                                className={`flex items-center gap-3 group border-b border-border/40 pb-2.5 last:border-0 p-1.5 transition rounded-lg ${
                                  isFocused ? "bg-muted/80 ring-1 ring-border/50" : ""
                                }`}
                              >
                              <img
                                src={p.image}
                                alt=""
                                className="h-11 w-11 rounded object-cover border border-border"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate group-hover:text-primary transition">
                                  {p.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {p.brand} · {formatINR(p.price)}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition opacity-0 group-hover:opacity-100" />
                            </Link>
                            );
                          })}
                        </div>
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
