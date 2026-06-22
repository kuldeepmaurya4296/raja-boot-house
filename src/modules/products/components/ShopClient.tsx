"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, RotateCcw, X, ArrowRight, ChevronDown } from "lucide-react";
import { ProductCard } from "@/modules/products/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RecentlyViewed } from "@/components/public/RecentlyViewed";

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
    <div className="border-b border-border/40 py-3 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left font-serif font-bold text-sm tracking-wide text-charcoal cursor-pointer hover:text-cognac transition-colors outline-none"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-brass" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden mt-2"
          >
            <div className="pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopClient({
  categories,
  initialProducts,
  totalProducts,
  filterMetadata,
}: ShopClientProps) {
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

  // Parse comma-separated lists for brands, sizes, genders, colors
  const activeBrands = useMemo(() => {
    return activeBrand
      ? activeBrand
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      : [];
  }, [activeBrand]);

  const activeSizes = useMemo(() => {
    return activeSize
      ? activeSize
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }, [activeSize]);

  const activeGenders = useMemo(() => {
    return activeGender
      ? activeGender
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean)
      : [];
  }, [activeGender]);

  const activeColors = useMemo(() => {
    return activeColor
      ? activeColor
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
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

  const updateFilters = (
    newParams: Record<string, string | null>,
    options?: { scroll?: boolean },
  ) => {
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
    updateFilters(
      {
        limit: String(activeLimit + 8),
      },
      { scroll: false },
    );
  };

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeBrand ||
    activeOccasion ||
    activeSearch ||
    activeMinPrice ||
    activeMaxPrice ||
    activeSize ||
    activeGender ||
    activeColor;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeCategory !== "all") count++;
    count += activeBrands.length;
    if (activeOccasion) count++;
    if (activeSearch) count++;
    if (activeMinPrice) count++;
    if (activeMaxPrice) count++;
    count += activeSizes.length;
    count += activeGenders.length;
    count += activeColors.length;
    return count;
  }, [
    activeCategory,
    activeBrands,
    activeOccasion,
    activeSearch,
    activeMinPrice,
    activeMaxPrice,
    activeSizes,
    activeGenders,
    activeColors,
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
      {/* Breadcrumb Navigation */}
      <div className="text-xs text-muted-foreground mb-8 flex gap-2 items-center bg-cream/40 backdrop-blur-xs py-2 px-4 rounded-full border border-border/40 w-fit shadow-xs">
        <Link href="/" className="hover:text-cognac transition-colors flex items-center gap-1">
          <span>Home</span>
        </Link>
        <span className="text-muted-foreground/50">/</span>
        {activeCategory === "all" ? (
          <span className="text-charcoal font-semibold">Shop</span>
        ) : (
          <>
            <Link href="/shop" className="hover:text-cognac transition-colors">
              Shop
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-charcoal font-semibold capitalize">
              {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
            </span>
          </>
        )}
      </div>

      {/* Luxury Title Banner */}
      <div className="relative mb-10 pb-8 border-b border-border/40">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 bg-muted/20 py-2.5 px-5 rounded-2xl border border-border/40">
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Total Styles
            </span>
            <span className="text-xl font-serif font-extrabold text-charcoal">{totalProducts}</span>
          </div>
          <div className="h-6 w-px bg-border/80" />
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Showing
            </span>
            <span className="text-xl font-serif font-extrabold text-cognac">
              {initialProducts.length}
            </span>
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-cognac font-extrabold mb-1.5">
          The Collection
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal">
          Footwear Catalog
        </h1>
        <p className="text-muted-foreground text-sm mt-3 max-w-2xl leading-relaxed">
          Step into craftsmanship with our premium range of hand-finished leather shoes, formal
          dress boots, and elegant casual styles.
        </p>
      </div>

      {/* Filter Chips Bar */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 mb-8 bg-brass/5 p-4 rounded-2xl border border-brass/15"
        >
          <span className="text-xs text-cognac font-bold mr-2 uppercase tracking-wider">
            Active Filters:
          </span>
          {activeCategory !== "all" && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs">
              <span>
                Category:{" "}
                {categories.find((c) => c.slug === activeCategory)?.name || activeCategory}
              </span>
              <button
                onClick={() => updateFilters({ category: "all" })}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {activeBrands.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs"
            >
              <span>Brand: {b}</span>
              <button
                onClick={() => handleToggleBrand(b)}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {activeOccasion && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs">
              <span>Occasion: {activeOccasion}</span>
              <button
                onClick={() => updateFilters({ occasion: null })}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {activeSearch && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs">
              <span>Query: "{activeSearch}"</span>
              <button
                onClick={() => updateFilters({ search: null })}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {activeMinPrice && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs">
              <span>Min: ₹{activeMinPrice}</span>
              <button
                onClick={() => updateFilters({ minPrice: null })}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {activeMaxPrice && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs">
              <span>Max: ₹{activeMaxPrice}</span>
              <button
                onClick={() => updateFilters({ maxPrice: null })}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {activeSizes.map((sStr) => (
            <span
              key={sStr}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs"
            >
              <span>Size: UK {sStr}</span>
              <button
                onClick={() => handleToggleSize(sStr)}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {activeGenders.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs"
            >
              <span>Gender: {g}</span>
              <button
                onClick={() => handleToggleGender(g)}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {activeColors.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-brass/25 text-cognac rounded-xl text-xs font-semibold shadow-xs"
            >
              <span>Color: {c}</span>
              <button
                onClick={() => handleToggleColor(c)}
                className="hover:text-destructive cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className="text-xs font-bold text-muted-foreground hover:text-destructive flex items-center gap-1.5 cursor-pointer py-1.5 px-3 hover:bg-muted/80 rounded-xl transition-colors ml-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
          </button>
        </motion.div>
      )}

      {/* Main Filter & Sort Controls Grid */}
      <div className="sticky top-16 md:top-20 z-20 -mx-4 md:mx-0 px-4 md:px-3 py-3.5 bg-cream/80 backdrop-blur-md border-y border-border/80 md:border md:rounded-2xl md:bg-card/90 md:p-5 md:shadow-lg mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 transition-all duration-300">
        {/* Categories scrollable container */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide pb-2 lg:pb-0 px-1 sm:px-0">
          <button
            onClick={() => updateFilters({ category: "all" })}
            className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 shadow-xs ${
              activeCategory === "all"
                ? "bg-charcoal text-cream shadow-md scale-102"
                : "bg-cream/60 text-muted-foreground hover:bg-cream hover:text-charcoal border border-border/50"
            }`}
          >
            All Styles
          </button>
          {categories.map((c) => (
            <button
              key={c.id || c._id}
              onClick={() => updateFilters({ category: c.slug })}
              className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 shadow-xs ${
                activeCategory === c.slug
                  ? "bg-charcoal text-cream shadow-md scale-102"
                  : "bg-cream/60 text-muted-foreground hover:bg-cream hover:text-charcoal border border-border/50"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Sort + Filter drawer toggle */}
        <div className="flex items-center justify-between lg:justify-end gap-4 text-sm px-1 sm:px-0 border-t border-border/30 pt-3 lg:border-0 lg:pt-0 shrink-0">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 bg-cream/80 hover:bg-cream border border-border/80 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer hover:shadow-sm hover:border-brass/50 transition duration-200"
          >
            <SlidersHorizontal className="h-4 w-4 text-cognac" />
            <span className="text-charcoal">Filter Options</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-cognac text-cream text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-extrabold animate-pulse">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">Sort By:</span>
            <div className="relative">
              <select
                value={activeSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="appearance-none bg-cream/85 border border-border/85 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-charcoal outline-none cursor-pointer focus:border-brass/60 focus:ring-1 focus:ring-brass/30 transition-all duration-200"
              >
                <option value="new">Newest Arrivals</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      {initialProducts.length === 0 ? (
        <div className="py-20 px-6 text-center border border-dashed border-brass/30 rounded-3xl bg-cream/30 backdrop-blur-xs flex flex-col items-center justify-center max-w-xl mx-auto my-12 shadow-xs">
          <div className="h-16 w-16 bg-brass/10 rounded-full flex items-center justify-center mb-6 text-cognac">
            <SlidersHorizontal className="h-8 w-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal mb-2">
            No Matching Styles Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            We couldn't find any footwear in our current catalog matching your filters. Try clearing
            some filters or searching for something else.
          </p>
          <button
            onClick={handleClearAll}
            className="bg-charcoal text-cream hover:bg-cognac px-6 py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {initialProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}

      {/* Pagination progress bar and load more button */}
      {initialProducts.length > 0 && initialProducts.length < totalProducts && (
        <div className="mt-16 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground font-semibold">
            Showing {initialProducts.length} of {totalProducts} footwear styles
          </p>
          <div className="w-48 h-1 bg-border/40 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-cognac rounded-full transition-all duration-500"
              style={{ width: `${(initialProducts.length / totalProducts) * 100}%` }}
            />
          </div>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3.5 bg-charcoal text-cream hover:bg-cognac text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-cream/35 border-t-cream rounded-full animate-spin" />
                Loading Styles…
              </>
            ) : (
              <>
                Load More Styles
                <ArrowRight className="h-4 w-4" />
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-40"
            />

            {/* Side Drawer menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 h-full w-[85vw] max-w-[340px] bg-cream/95 backdrop-blur-md border-r border-border/80 shadow-2xl z-50 flex flex-col p-6 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                <span className="font-serif font-bold text-lg text-charcoal flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-cognac" />
                  <span>Filter Catalog</span>
                </span>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="p-1.5 hover:bg-muted/80 rounded-full transition cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Drawer Sections - Accordion System */}
              <div className="flex-grow overflow-y-auto pr-1 scrollbar-thin space-y-1">
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
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? "bg-cognac/5 border-cognac/40 text-cognac"
                              : "border-border/60 hover:bg-muted/60 text-foreground"
                          }`}
                        >
                          <span>{c.name}</span>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-cognac" />}
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
                        const isSelected = activeGenders.some(
                          (ag) => ag.toLowerCase() === g.toLowerCase(),
                        );
                        return (
                          <button
                            key={g}
                            onClick={() => handleToggleGender(g)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-cognac/5 border-cognac/40 text-cognac"
                                : "border-border/60 hover:bg-muted/60 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="h-4 w-4 rounded border-border text-cognac focus:ring-cognac cursor-pointer accent-cognac"
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
                        const isSelected = activeBrands.some(
                          (ab) => ab.toLowerCase() === b.toLowerCase(),
                        );
                        return (
                          <button
                            key={b}
                            onClick={() => handleToggleBrand(b)}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-cognac/5 border-cognac/40 text-cognac"
                                : "border-border/60 hover:bg-muted/60 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="h-4 w-4 rounded border-border text-cognac focus:ring-cognac cursor-pointer accent-cognac"
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
                            className={`py-2 border text-xs font-bold rounded-xl transition cursor-pointer ${
                              isSelected
                                ? "bg-cognac text-cream border-cognac shadow-xs"
                                : "border-border/80 hover:border-brass/50 text-foreground bg-cream/40"
                            }`}
                          >
                            UK {s}
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
                        const isSelected = activeColors.some(
                          (ac) => ac.toLowerCase() === c.name.toLowerCase(),
                        );
                        return (
                          <button
                            key={c.name}
                            onClick={() => handleToggleColor(c.name)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer ${
                              isSelected
                                ? "bg-cognac/5 border-cognac/40 text-cognac"
                                : "border-border/60 hover:bg-muted/60 text-foreground"
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
                                ? "bg-cognac text-cream border-cognac shadow-xs"
                                : "border-border/80 hover:bg-muted text-muted-foreground bg-cream/40"
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
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={minInput}
                          onChange={(e) => setMinInput(e.target.value)}
                          className="w-full pl-6 pr-2 py-2 bg-cream border border-border/80 rounded-xl text-xs outline-none focus:border-cognac transition"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">-</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                          ₹
                        </span>
                        <input
                          type="number"
                          placeholder={`Max (${Math.ceil(filterMetadata.maxPrice)})`}
                          value={maxInput}
                          onChange={(e) => setMaxInput(e.target.value)}
                          className="w-full pl-6 pr-2 py-2 bg-cream border border-border/80 rounded-xl text-xs outline-none focus:border-cognac transition"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-cognac/10 text-cognac text-xs font-bold rounded-xl hover:bg-cognac hover:text-cream transition cursor-pointer"
                    >
                      Apply Price
                    </button>
                  </form>
                </AccordionItem>
              </div>

              {/* Bottom Actions - Sticky at bottom */}
              <div className="mt-4 border-t border-border/40 pt-4 flex gap-2.5 shrink-0 bg-cream/95">
                <button
                  onClick={handleClearAll}
                  className="flex-1 py-3 border border-border rounded-full text-xs font-bold hover:bg-muted transition cursor-pointer text-charcoal"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex-grow py-3 bg-charcoal text-cream hover:bg-cognac rounded-full text-xs font-bold transition cursor-pointer shadow-md"
                >
                  View Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <RecentlyViewed />
    </div>
  );
}
