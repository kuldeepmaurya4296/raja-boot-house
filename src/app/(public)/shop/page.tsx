"use client";

import { ProductCard } from "@/components/public/ProductCard";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function ShopPage() {
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "low" | "high" | "rating">("new");

  const filtered = useMemo(() => {
    let list = cat === "all" ? products : products.filter(p => p.category === cat);
    return [...list].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [cat, sort]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold">The Collection</p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold mt-2">All Boots</h1>
        <p className="text-muted-foreground mt-2">{filtered.length} pairs · crafted in Mumbai</p>
      </div>

      {/* Filter row */}
      <div className="sticky top-16 md:top-20 z-20 -mx-4 md:mx-0 px-4 md:px-0 py-3 bg-cream/90 backdrop-blur border-y border-border md:border-0 md:rounded-xl md:bg-card md:border md:p-4 md:shadow-card mb-6 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2">
          <button onClick={() => setCat("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${cat === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCat(c.slug)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${cat === c.slug ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{c.name}</button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select value={sort} onChange={e => setSort(e.target.value as any)} className="bg-card border border-input rounded-lg px-3 py-1.5 text-sm">
            <option value="new">Newest</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}
