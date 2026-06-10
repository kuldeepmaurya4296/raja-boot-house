"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, RotateCcw, X } from "lucide-react";
import { ProductCard } from "@/modules/products/components/ProductCard";

interface ShopClientProps {
  categories: any[];
  initialProducts: any[];
}

export default function ShopClient({ categories, initialProducts }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Filter Parameters
  const activeCategory = searchParams.get("category") || "all";
  const activeBrand = searchParams.get("brand") || "";
  const activeOccasion = searchParams.get("occasion") || "";
  const activeSearch = searchParams.get("search") || "";
  const activeSort = (searchParams.get("sort") || "new") as "new" | "low" | "high" | "rating";

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

  const hasActiveFilters = activeCategory !== "all" || activeBrand || activeOccasion || activeSearch;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold">The Collection</p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold mt-2 text-charcoal">Footwear Catalog</h1>
        <p className="text-muted-foreground mt-2">
          {initialProducts.length} products · Raja Boot House
        </p>
      </div>

      {/* Filter Chips Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-muted-foreground font-semibold mr-1">Active Filters:</span>
          {activeCategory !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Category: {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
              <button onClick={() => updateFilters({ category: "all" })} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeBrand && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Brand: {activeBrand}
              <button onClick={() => updateFilters({ brand: null })} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeOccasion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Occasion: {activeOccasion}
              <button onClick={() => updateFilters({ occasion: null })} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeSearch && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Query: "{activeSearch}"
              <button onClick={() => updateFilters({ search: null })} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
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
      <div className="sticky top-16 md:top-20 z-20 -mx-4 md:mx-0 px-4 md:px-2 py-3 bg-cream/90 backdrop-blur border-y border-border md:border-0 md:rounded-xl md:bg-card md:border md:p-4 md:shadow-card mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Categories scrollable container */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 px-4 sm:px-0 -mx-4 sm:mx-0">
          <button
            onClick={() => updateFilters({ category: "all" })}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition ${activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-secondary"
              }`}
          >
            All Styles
          </button>
          {categories.map((c) => (
            <button
              key={c.id || c._id}
              onClick={() => updateFilters({ category: c.slug })}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition ${activeCategory === c.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-secondary"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort select box */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-sm px-4 sm:px-0 border-t border-border/40 pt-2 sm:border-0 sm:pt-0 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Sort by:</span>
          </div>
          <select
            value={activeSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="bg-card border border-input rounded-lg px-3 py-2 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="new">Newest Arrivals</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {initialProducts.length === 0 ? (
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
          {initialProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
