"use client";

import { ProductCard } from "@/modules/products/components/ProductCard";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Filter Parameters
  const activeCategory = searchParams.get("category") || "all";
  const activeBrand = searchParams.get("brand") || "";
  const activeOccasion = searchParams.get("occasion") || "";
  const activeSearch = searchParams.get("search") || "";
  const activeSort = (searchParams.get("sort") || "new") as "new" | "low" | "high" | "rating";

  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Fetch filtered products from backend API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeBrand) params.set("brand", activeBrand);
    if (activeOccasion) params.set("occasion", activeOccasion);
    if (activeSearch) params.set("search", activeSearch);
    params.set("sort", activeSort);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductList(data);
        }
      })
      .catch((err) => console.error("Error loading shop products:", err))
      .finally(() => setLoading(false));
  }, [activeCategory, activeBrand, activeOccasion, activeSearch, activeSort]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  const handleClearAll = () => {
    router.push("/shop");
  };

  const filtered = useMemo(() => {
    return productList;
  }, [productList]);

  const hasActiveFilters = activeCategory !== "all" || activeBrand || activeOccasion || activeSearch;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold">The Collection</p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold mt-2 text-charcoal">Footwear Catalog</h1>
        <p className="text-muted-foreground mt-2">
          {filtered.length} products · Raja Boot House
        </p>
      </div>

      {/* Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground font-semibold mr-1">Active Filters:</span>
          {activeCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Category: {categoriesList.find(c => c.slug === activeCategory)?.name || activeCategory}
              <button onClick={() => updateFilters({ category: "all" })} className="hover:opacity-70"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeBrand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Brand: {activeBrand}
              <button onClick={() => updateFilters({ brand: null })} className="hover:opacity-70"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeOccasion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Occasion: {activeOccasion}
              <button onClick={() => updateFilters({ occasion: null })} className="hover:opacity-70"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeSearch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Query: "{activeSearch}"
              <button onClick={() => updateFilters({ search: null })} className="hover:opacity-70"><X className="h-3 w-3" /></button>
            </span>
          )}
          <button
            onClick={handleClearAll}
            className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer py-1 px-2 hover:bg-muted rounded transition ml-auto"
          >
            <RotateCcw className="h-3 w-3" /> Clear filters
          </button>
        </div>
      )}

      {/* Main Filter & Sort Controls Grid */}
      <div className="sticky top-16 md:top-20 z-20 -mx-4 md:mx-0 px-4 md:px-0 py-3 bg-cream/90 backdrop-blur border-y border-border md:border-0 md:rounded-xl md:bg-card md:border md:p-4 md:shadow-card mb-8 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateFilters({ category: "all" })}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-secondary"
            }`}
          >
            All Silhouettes
          </button>
          {categoriesList.map((c) => (
            <button
              key={c.id || c._id}
              onClick={() => updateFilters({ category: c.slug })}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                activeCategory === c.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-secondary"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={activeSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="bg-card border border-input rounded-lg px-3 py-2 text-xs font-medium outline-none"
          >
            <option value="new">Newest Arrivals</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-20">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-3">
              <div className="aspect-[4/5] bg-muted rounded-xl"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-card">
          <p className="text-base text-muted-foreground">No footwear styles found matching these filters.</p>
          <button
            onClick={handleClearAll}
            className="mt-4 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer"
          >
            Reset Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
