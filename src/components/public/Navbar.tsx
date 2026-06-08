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
  
  // Dynamic categories
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    } catch {}
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
    } catch {}

    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
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
        .map((p) => p.vendorId || p.brand)
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
              className={`text-sm font-medium hover:text-primary transition-colors uppercase tracking-wider ${
                path === "/shop" ? "text-primary font-semibold" : "text-foreground/80"
              }`}
            >
              All Shoes
            </Link>
            {links.map((l) => {
              const active = path + searchParams.toString() === l.href;
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
              href={accountLink}
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
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="md:hidden overflow-hidden border-t border-border bg-card"
            >
              <div className="flex flex-col p-4 gap-1">
                <Link
                  href="/shop"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted"
                >
                  All Shoes
                </Link>
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
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
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(searchQuery)}
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

                      {/* Quick Silhouettes category suggestions */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                          Popular Silhouettes
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
                            {matchedBrands.map((b) => (
                              <button
                                key={b}
                                onClick={() => {
                                  setSearchOpen(false);
                                  router.push(`/shop?brand=${encodeURIComponent(b)}`);
                                }}
                                className="px-3 py-1 bg-brass/10 border border-brass/20 text-cognac rounded-full text-xs font-semibold hover:bg-brass/20 transition"
                              >
                                {b}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Products */}
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                          Matched Products ({searchResults.length})
                        </h4>
                        <div className="space-y-3">
                          {searchResults.slice(0, 6).map((p) => (
                            <Link
                              key={p.id}
                              href={`/shop/${p.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 group border-b border-border/40 pb-2.5 last:border-0"
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
                                  {p.vendorId} · {formatINR(p.price)}
                                </p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition opacity-0 group-hover:opacity-100" />
                            </Link>
                          ))}
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
