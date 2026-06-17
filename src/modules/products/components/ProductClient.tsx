"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Heart, ShoppingBag, Star, ChevronRight, Share2, Package, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/modules/products/components/ProductCard";
import { formatINR } from "@/lib/format";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

// Sub-components
import { ProductGallery } from "@/modules/products/components/ProductGallery";
import { SizeSelector } from "@/modules/products/components/SizeSelector";
import { ColorSelector } from "@/modules/products/components/ColorSelector";
import { TrustBadges } from "@/components/public/TrustBadges";
import { ReviewsSection } from "@/modules/reviews/components/ReviewsSection";
import { QuantitySelector } from "@/components/shared/QuantitySelector";

interface ProductClientProps {
  product: any;
  initialReviews: any[];
  relatedProducts: any[];
}

export default function ProductClient({ product, initialReviews, relatedProducts }: ProductClientProps) {
  const router = useRouter();
  const { add, wishlist, toggleWish } = useCart();
  const [size, setSize] = useState<number | null>(null);
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [addingToBag, setAddingToBag] = useState(false);

  // Map color names to their corresponding hex values from variants
  const colorsWithHex = useMemo(() => {
    const map = new Map<string, string>();
    if (product.variants) {
      product.variants.forEach((v: any) => {
        if (v.color && v.colorHex) {
          map.set(v.color.toLowerCase(), v.colorHex);
        }
      });
    }
    return (product.colors || []).map((c: string) => ({
      name: c,
      hex: map.get(c.toLowerCase()) || "#cccccc"
    }));
  }, [product.colors, product.variants]);

  // Find which sizes are actually available (stock > 0) for the selected color
  const availableSizesForColor = useMemo(() => {
    if (!color || !product.variants) return [];
    return product.variants
      .filter((v: any) => v.color?.toLowerCase() === color.toLowerCase() && v.stock > 0)
      .map((v: any) => v.size);
  }, [color, product.variants]);

  // Find the exact variant matching the selected color and size
  const selectedVariant = useMemo(() => {
    if (!color || !size || !product.variants) return null;
    return product.variants.find(
      (v: any) => v.color?.toLowerCase() === color.toLowerCase() && v.size === size
    );
  }, [color, size, product.variants]);

  // Find if there's any variant matching the selected color that has custom images
  const activeGallery = useMemo(() => {
    if (!color || !product.variants) return product.gallery;
    const match = product.variants.find(
      (v: any) => v.color?.toLowerCase() === color.toLowerCase() && v.images && v.images.length > 0
    );
    if (match) {
      return match.images.map((img: any) => img.url);
    }
    return product.gallery;
  }, [color, product.gallery, product.variants]);

  useEffect(() => {
    if (product && !color && product.colors?.length > 0) {
      setColor(product.colors[0]);
    }
  }, [product, color]);

  // If color changes and currently selected size is not available, reset size selection
  useEffect(() => {
    if (color && size !== null && !availableSizesForColor.includes(size)) {
      setSize(null);
    }
  }, [color, availableSizesForColor, size]);

  useEffect(() => {
    if (typeof window === "undefined" || !product) return;
    try {
      const stored = localStorage.getItem("rbh-recently-viewed");
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter((p: any) => p.id !== product.id);
      list.unshift({
        id: product.id,
        name: product.name,
        price: product.price,
        compareAt: product.compareAt,
        image: product.gallery?.[0] || "",
        slug: product.slug,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
      });
      const sliced = list.slice(0, 5);
      localStorage.setItem("rbh-recently-viewed", JSON.stringify(sliced));
      setRecentlyViewed(sliced.filter((p: any) => p.id !== product.id).slice(0, 4));
    } catch (err) {
      console.error("Failed to update recently viewed:", err);
    }
  }, [product]);

  const wished = wishlist.includes(product.id);

  const discountPercent = product.compareAt && product.compareAt > product.price
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : null;

  const isOutOfStock = size !== null && selectedVariant && selectedVariant.stock <= 0;
  const isLowStock = size !== null && selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5;

  const handleAdd = async () => {
    if (!size) {
      toast.error("Please select a size before adding to bag");
      return;
    }
    if (isOutOfStock) {
      toast.error("This color/size combination is out of stock");
      return;
    }
    setAddingToBag(true);
    await new Promise(r => setTimeout(r, 400));
    add(product, { size, color, quantity: qty });
    setAddingToBag(false);
    router.push("/cart");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-primary transition-colors capitalize">
              {product.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[160px]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 md:gap-14 lg:gap-20">
        {/* Gallery */}
        <ProductGallery gallery={activeGallery} name={product.name} />

        {/* Info Panel */}
        <div className="space-y-5">
          {/* Product header */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-cognac font-bold mb-1.5">{product.brand || product.category}</p>
                <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">{product.name}</h1>
              </div>
              <button
                onClick={handleShare}
                className="p-2.5 border border-border rounded-xl hover:bg-muted transition mt-1 shrink-0"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Rating Row */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "fill-brass text-brass" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">{product.rating} · {product.reviewsCount} reviews</span>
            </div>

            {/* Price Block */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl md:text-4xl font-bold text-primary">{formatINR(product.price)}</span>
              {product.compareAt && (
                <span className="text-muted-foreground line-through text-base">{formatINR(product.compareAt)}</span>
              )}
              {discountPercent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" />
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            <div
              className="mt-4 text-sm text-muted-foreground leading-relaxed prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* Color Selector */}
          <ColorSelector colors={colorsWithHex} selectedColor={color} onSelect={setColor} />

          {/* Size Selector */}
          <SizeSelector sizes={product.sizes} selectedSize={size} onSelect={setSize} availableSizes={availableSizesForColor} />

          {/* Stock Feedback */}
          {size !== null && selectedVariant && (
            <div className="text-xs font-semibold animate-in fade-in duration-200 px-3 py-2 rounded-lg inline-flex items-center gap-2 border w-fit">
              {isOutOfStock ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-destructive">Out of stock — notify me</span>
                </>
              ) : isLowStock ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-cognac animate-pulse" />
                  <span className="text-cognac">Only {selectedVariant.stock} left — order soon!</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-emerald-600">In stock · Ready to ship</span>
                </>
              )}
            </div>
          )}

          {/* Qty + CTA Row */}
          <div className="flex gap-3 items-center pt-1">
            <QuantitySelector quantity={qty} onChange={setQty} />
            <button
              onClick={handleAdd}
              disabled={!!isOutOfStock || addingToBag}
              className="flex-1 bg-primary text-primary-foreground rounded-full h-12 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {addingToBag ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  {isOutOfStock ? "Out of Stock" : "Add to Bag"}
                </>
              )}
            </button>
            <button
              onClick={() => toggleWish(product.id)}
              className={`h-12 w-12 grid place-items-center border rounded-full hover:bg-muted transition cursor-pointer shrink-0 ${wished ? "border-primary bg-primary/5" : "border-border"}`}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          {/* Crafted Details */}
          {product.details?.length > 0 && (
            <div className="border-t border-border/60 pt-5 space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                <Package className="h-3.5 w-3.5 inline-block mr-1.5 text-cognac" />
                Crafted With
              </h3>
              <ul className="space-y-1.5">
                {product.details.map((d: any) => (
                  <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-cognac font-bold mt-0.5">·</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection reviews={initialReviews} productId={product.id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 md:mt-24 border-t border-border pt-12">
          <div className="flex items-baseline justify-between mb-6 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-cognac font-bold mb-1">You May Also Like</p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold">Complete Your Collection</h2>
            </div>
            <Link href="/shop" className="text-xs font-bold text-primary hover:underline underline-offset-2 shrink-0 flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16 md:mt-24 border-t border-border pt-12 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cognac font-bold mb-1">Continue Browsing</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Recently Viewed Styles</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
