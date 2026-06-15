"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, RotateCcw, X, ArrowRight, ChevronDown } from "lucide-react";
import { ProductCard } from "@/modules/products/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ShopClientProps {
  categories: any[];
  initialProducts: any[];
  totalProducts: number;
  filterMetadata: {
    brands: string[];
    sizes: number[];
    occasions: string[];
    colors: { name: string; hex: string }[];
    genders: string[];
    maxPrice: number;
  };
}

interface AccordionItemProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionItem({ title, isOpen, onToggle, children }: AccordionItemProps) {
  return (
    <div className="border-b border-border/50 py-3.5 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left font-serif font-bold text-sm tracking-wide text-charcoal cursor-pointer hover:text-primary transition-colors outline-none"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground shrink-0"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-3"
          >
            <div className="pb-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopClient({ categories, initialProducts, totalProducts, filterMetadata }: ShopClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter Drawer State
  const [filterOpen, setFilterOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Accordion open/close state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: true,
    size: true,
    price: false,
    occasion: false,
    color: false,
    gender: false,
    category: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const brands = filterMetadata.brands;

  // Reset loadingState when initialProducts updates
  useEffect(() => {
    setLoadingMore(false);
  }, [initialProducts]);

  // URL Filter Parameters
  const activeCategory = searchParams.get("category") || "all";
  const activeBrand = searchParams.get("brand") || "";
  const activeOccasion = searchParams.get("occasion") || "";
  const activeSearch = searchParams.get("search") || "";
  const activeSort = (searchParams.get("sort") || "new") as "new" | "low" | "high" | "rating";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";
  const activeSize = searchParams.get("size") || "";
  const activeLimit = parseInt(searchParams.get("limit") || "8", 10);
  const activeGender = searchParams.get("gender") || "";
  const activeColor = searchParams.get("color") || "";

  // Parse comma-separated lists for brands and sizes
  const activeBrands = useMemo(() => {
    return activeBrand ? activeBrand.split(",").map((b) => b.trim()).filter(Boolean) : [];
  }, [activeBrand]);

  const activeSizes = useMemo(() => {
    return activeSize ? activeSize.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }, [activeSize]);

  const activeGenders = useMemo(() => {
    return activeGender ? activeGender.split(",").map((g) => g.trim()).filter(Boolean) : [];
  }, [activeGender]);

  const activeColors = useMemo(() => {
    return activeColor ? activeColor.split(",").map((c) => c.trim()).filter(Boolean) : [];
  }, [activeColor]);

  // Local state for price inputs
  const [minInput, setMinInput] = useState(activeMinPrice);
  const [maxInput, setMaxInput] = useState(activeMaxPrice);

  // Sync inputs when URL changes
  useEffect(() => {
    setMinInput(activeMinPrice);
  }, [activeMinPrice]);

  useEffect(() => {
    setMaxInput(activeMaxPrice);
  }, [activeMaxPrice]);

  const updateFilters = (newParams: Record<string, string | null>, options?: { scroll?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset limit if we are changing other filters
    if (!("limit" in newParams)) {
      params.delete("limit");
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/shop?${params.toString()}`, { scroll: options?.scroll ?? true });
  };

  const handleToggleBrand = (b: string) => {
    const isSelected = activeBrands.some((ab) => ab.toLowerCase() === b.toLowerCase());
    let newBrands;
    if (isSelected) {
      newBrands = activeBrands.filter((ab) => ab.toLowerCase() !== b.toLowerCase());
    } else {
      newBrands = [...activeBrands, b];
    }
    updateFilters({ brand: newBrands.length > 0 ? newBrands.join(",") : null });
  };

  const handleToggleSize = (sStr: string) => {
    const isSelected = activeSizes.includes(sStr);
    let newSizes;
    if (isSelected) {
      newSizes = activeSizes.filter((x) => x !== sStr);
    } else {
      newSizes = [...activeSizes, sStr];
    }
    updateFilters({ size: newSizes.length > 0 ? newSizes.join(",") : null });
  };

  const handleToggleGender = (g: string) => {
    const isSelected = activeGenders.some((ag) => ag.toLowerCase() === g.toLowerCase());
    let newGenders;
    if (isSelected) {
      newGenders = activeGenders.filter((ag) => ag.toLowerCase() !== g.toLowerCase());
    } else {
      newGenders = [...activeGenders, g];
    }
    updateFilters({ gender: newGenders.length > 0 ? newGenders.join(",") : null });
  };

  const handleToggleColor = (c: string) => {
    const isSelected = activeColors.some((ac) => ac.toLowerCase() === c.toLowerCase());
    let newColors;
    if (isSelected) {
      newColors = activeColors.filter((ac) => ac.toLowerCase() !== c.toLowerCase());
    } else {
      newColors = [...activeColors, c];
    }
    updateFilters({ color: newColors.length > 0 ? newColors.join(",") : null });
  };

  const handleClearAll = () => {
    setMinInput("");
    setMaxInput("");
    router.push("/shop");
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minInput.trim() || null,
      maxPrice: maxInput.trim() || null,
    });
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    updateFilters({
      limit: String(activeLimit + 8),
    }, { scroll: false });
  };

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeBrand ||
    activeOccasion ||
    activeSearch ||
    activeMinPrice ||
    activeMaxPrice ||
    activeSize;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-muted-foreground mb-6 flex gap-1 items-center">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <span>/</span>
        {activeCategory === "all" ? (
          <span className="text-foreground">Shop</span>
        ) : (
          <>
            <Link href="/shop" className="hover:text-primary transition">Shop</Link>
            <span>/</span>
            <span className="text-foreground capitalize">
              {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
            </span>
          </>
        )}
      </div>

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
          {activeBrands.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Brand: {b}
              <button onClick={() => handleToggleBrand(b)} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          ))}
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
          {activeMinPrice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Min: ₹{activeMinPrice}
              <button onClick={() => updateFilters({ minPrice: null })} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeMaxPrice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Max: ₹{activeMaxPrice}
              <button onClick={() => updateFilters({ maxPrice: null })} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          )}
          {activeSizes.map((sStr) => (
            <span key={sStr} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Size: UK/IND {sStr}
              <button onClick={() => handleToggleSize(sStr)} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          ))}
          {activeGenders.map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Gender: {g}
              <button onClick={() => handleToggleGender(g)} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          ))}
          {activeColors.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 bg-brass/10 text-cognac rounded-full text-xs font-semibold">
              Color: {c}
              <button onClick={() => handleToggleColor(c)} className="hover:opacity-70 cursor-pointer"><X className="h-3 w-3" /></button>
            </span>
          ))}
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

        {/* Sort + Filter drawer toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-sm px-4 sm:px-0 border-t border-border/40 pt-2 sm:border-0 sm:pt-0 shrink-0">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-1.5 bg-card border border-input rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-muted transition"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Sort:</span>
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

      {initialProducts.length > 0 && initialProducts.length < totalProducts && (
        <div className="mt-14 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-full hover:bg-primary/90 transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading Styles…
              </>
            ) : (
              <>
                Load More Styles
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Filter Side Drawer Panel */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-charcoal/45 z-40 backdrop-blur-xs"
            />

            {/* Side Drawer menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 bottom-0 h-full w-[80vw] max-w-[320px] bg-card border-r border-border shadow-2xl z-50 flex flex-col p-6 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <span className="font-serif font-bold text-lg text-charcoal">
                  Filter Catalog
                </span>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-full transition"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              {/* Drawer Sections - Accordion System */}
              <div className="flex flex-col flex-grow overflow-y-auto pr-1">
                {/* Category Accordion */}
                <AccordionItem
                  title="Category"
                  isOpen={expandedSections.category}
                  onToggle={() => toggleSection("category")}
                >
                  <div className="flex flex-col gap-1.5">
                    {categories.map((c) => {
                      const isSelected = activeCategory === c.slug;
                      return (
                        <button
                          key={c.id || c._id}
                          onClick={() => updateFilters({ category: isSelected ? "all" : c.slug })}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-primary/5 border-primary text-primary"
                              : "border-border/80 hover:bg-muted text-foreground"
                          }`}
                        >
                          <span>{c.name}</span>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </AccordionItem>

                {/* Gender Accordion */}
                {filterMetadata.genders.length > 0 && (
                  <AccordionItem
                    title="Gender"
                    isOpen={expandedSections.gender}
                    onToggle={() => toggleSection("gender")}
                  >
                    <div className="flex flex-col gap-1.5">
                      {filterMetadata.genders.map((g) => {
                        const isSelected = activeGenders.some((ag) => ag.toLowerCase() === g.toLowerCase());
                        return (
                          <button
                            key={g}
                            onClick={() => handleToggleGender(g)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-primary/5 border-primary text-primary"
                                : "border-border/80 hover:bg-muted text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>{g}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionItem>
                )}

                {/* Brand Accordion */}
                {brands.length > 0 && (
                  <AccordionItem
                    title="Brand"
                    isOpen={expandedSections.brand}
                    onToggle={() => toggleSection("brand")}
                  >
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {brands.map((b) => {
                        const isSelected = activeBrands.some((ab) => ab.toLowerCase() === b.toLowerCase());
                        return (
                          <button
                            key={b}
                            onClick={() => handleToggleBrand(b)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-primary/5 border-primary text-primary"
                                : "border-border/80 hover:bg-muted text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>{b}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionItem>
                )}

                {/* Size Accordion */}
                {filterMetadata.sizes.length > 0 && (
                  <AccordionItem
                    title="Select Size"
                    isOpen={expandedSections.size}
                    onToggle={() => toggleSection("size")}
                  >
                    <div className="grid grid-cols-4 gap-1.5">
                      {filterMetadata.sizes.map((s) => {
                        const sStr = s.toString();
                        const isSelected = activeSizes.includes(sStr);
                        return (
                          <button
                            key={s}
                            onClick={() => handleToggleSize(sStr)}
                            className={`py-2 border text-xs font-bold rounded-lg transition cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:border-primary/50 text-foreground"
                            }`}
                          >
                            UK/IND {s}
                          </button>
                        );
                      })}
                    </div>
                  </AccordionItem>
                )}

                {/* Color Accordion */}
                {filterMetadata.colors.length > 0 && (
                  <AccordionItem
                    title="Color"
                    isOpen={expandedSections.color}
                    onToggle={() => toggleSection("color")}
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      {filterMetadata.colors.map((c) => {
                        const isSelected = activeColors.some((ac) => ac.toLowerCase() === c.name.toLowerCase());
                        return (
                          <button
                            key={c.name}
                            onClick={() => handleToggleColor(c.name)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-primary/5 border-primary text-primary"
                                : "border-border/80 hover:bg-muted text-foreground"
                            }`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full border border-black/15 shadow-sm shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionItem>
                )}

                {/* Occasion Accordion */}
                {filterMetadata.occasions.length > 0 && (
                  <AccordionItem
                    title="Occasion"
                    isOpen={expandedSections.occasion}
                    onToggle={() => toggleSection("occasion")}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {filterMetadata.occasions.map((o) => {
                        const isSelected = activeOccasion.toLowerCase() === o.toLowerCase();
                        return (
                          <button
                            key={o}
                            onClick={() => updateFilters({ occasion: isSelected ? null : o })}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border/80 hover:bg-muted text-muted-foreground"
                            }`}
                          >
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  </AccordionItem>
                )}

                {/* Price Range Accordion */}
                <AccordionItem
                  title="Price Range"
                  isOpen={expandedSections.price}
                  onToggle={() => toggleSection("price")}
                >
                  <form onSubmit={handleApplyPrice} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">₹</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={minInput}
                          onChange={(e) => setMinInput(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-background border border-input rounded-lg text-xs outline-none focus:border-primary transition"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">₹</span>
                        <input
                          type="number"
                          placeholder={`Max (${Math.ceil(filterMetadata.maxPrice)})`}
                          value={maxInput}
                          onChange={(e) => setMaxInput(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-background border border-input rounded-lg text-xs outline-none focus:border-primary transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary/25 transition cursor-pointer"
                    >
                      Apply Price
                    </button>
                  </form>
                </AccordionItem>
              </div>

              {/* Bottom Actions */}
              <div className="mt-8 border-t border-border pt-4 flex gap-2.5">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-2.5 border border-border rounded-full text-xs font-semibold hover:bg-muted transition cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex-grow py-2.5 bg-primary text-primary-foreground rounded-full text-xs font-semibold hover:bg-primary/95 transition cursor-pointer"
                >
                  View Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
