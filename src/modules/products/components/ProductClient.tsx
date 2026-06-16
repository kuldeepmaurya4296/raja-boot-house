"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
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

  const handleAdd = () => {
    if (!size) {
      toast.error("Please select a size before adding to bag");
      return;
    }
    if (selectedVariant && selectedVariant.stock <= 0) {
      toast.error("This color/size combination is out of stock");
      return;
    }
    add(product, { size, color, quantity: qty });
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="text-xs text-muted-foreground mb-6 flex gap-1">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        {/* Gallery */}
        <ProductGallery gallery={activeGallery} name={product.name} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-brass text-brass" : "text-brass"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{product.rating} · {product.reviewsCount} reviews</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold">{formatINR(product.price)}</span>
              {product.compareAt && <span className="text-muted-foreground line-through">{formatINR(product.compareAt)}</span>}
            </div>
            <div 
              className="mt-5 text-muted-foreground leading-relaxed prose prose-stone max-w-none text-sm space-y-1"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>

          {/* Color Selector */}
          <ColorSelector colors={colorsWithHex} selectedColor={color} onSelect={setColor} />

          {/* Size Selector */}
          <SizeSelector sizes={product.sizes} selectedSize={size} onSelect={setSize} availableSizes={availableSizesForColor} />

          {/* Stock Feedback */}
          {size !== null && selectedVariant && (
            <div className="text-xs font-semibold px-1 py-0.5 animate-in fade-in duration-200">
              {selectedVariant.stock === 0 ? (
                <span className="text-destructive flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" /> Out of stock
                </span>
              ) : selectedVariant.stock <= 5 ? (
                <span className="text-cognac flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-cognac animate-pulse" /> Only {selectedVariant.stock} left in stock - order soon!
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock (ready to ship)
                </span>
              )}
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex gap-3 items-center pt-2">
            <QuantitySelector quantity={qty} onChange={setQty} />
            <button 
              onClick={handleAdd} 
              disabled={size !== null && selectedVariant && selectedVariant.stock <= 0}
              className="flex-1 bg-primary text-primary-foreground rounded-full h-12 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="h-4 w-4" /> {size !== null && selectedVariant && selectedVariant.stock <= 0 ? "Out of stock" : "Add to bag"}
            </button>
            <button onClick={() => toggleWish(product.id)} className="h-12 w-12 grid place-items-center border border-border rounded-full hover:bg-muted transition cursor-pointer">
              <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          {/* Details */}
          <div className="border-t border-border pt-6 space-y-3">
            <h3 className="font-semibold text-sm">Crafted with</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {product.details.map((d: any) => <li key={d} className="flex gap-2"><span className="text-cognac">·</span>{d}</li>)}
            </ul>
          </div>

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection reviews={initialReviews} productId={product.id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="mt-16 md:mt-24 border-t border-border pt-16 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6 text-charcoal">Recently Viewed Styles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
