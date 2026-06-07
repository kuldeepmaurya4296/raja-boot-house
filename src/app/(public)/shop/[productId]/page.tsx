"use client";

import React, { useState } from "react";
import { findProduct, products } from "@/data/products";
import { reviewsByProduct } from "@/data/reviews";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/public/ProductCard";
import { formatINR } from "@/lib/format";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Sub-components
import { ProductGallery } from "@/components/public/ProductGallery";
import { SizeSelector } from "@/components/public/SizeSelector";
import { ColorSelector } from "@/components/public/ColorSelector";
import { TrustBadges } from "@/components/public/TrustBadges";
import { ReviewsSection } from "@/components/public/ReviewsSection";
import { QuantitySelector } from "@/components/shared/QuantitySelector";

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductPage({ params }: PageProps) {
  const { productId } = React.use(params);
  const product = findProduct(productId);
  const router = useRouter();
  const { add, wishlist, toggleWish } = useCart();
  const [size, setSize] = useState<number | null>(null);
  const [color, setColor] = useState(product?.colors[0] || "");
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="mb-4">Product not found.</p>
        <Link href="/shop" className="underline font-semibold">
          Back to shop
        </Link>
      </div>
    );
  }

  const wished = wishlist.includes(product.id);
  const reviews = reviewsByProduct(product.id);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    if (!size) {
      alert("Please select a size");
      return;
    }
    add(product, { size, color, quantity: qty });
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
      <div className="text-xs text-muted-foreground mb-6 flex gap-1">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16">
        {/* Gallery */}
        <ProductGallery gallery={product.gallery} name={product.name} />

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mt-2">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-brass text-brass" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{product.rating} · {product.reviewsCount} reviews</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold">{formatINR(product.price)}</span>
              {product.compareAt && <span className="text-muted-foreground line-through">{formatINR(product.compareAt)}</span>}
            </div>
            <p className="mt-5 text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Color Selector */}
          <ColorSelector colors={product.colors} selectedColor={color} onSelect={setColor} />

          {/* Size Selector */}
          <SizeSelector sizes={product.sizes} selectedSize={size} onSelect={setSize} />

          {/* Qty + CTA */}
          <div className="flex gap-3 items-center pt-2">
            <QuantitySelector quantity={qty} onChange={setQty} />
            <button onClick={handleAdd} className="flex-1 bg-primary text-primary-foreground rounded-full h-12 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition cursor-pointer">
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </button>
            <button onClick={() => toggleWish(product.id)} className="h-12 w-12 grid place-items-center border border-border rounded-full hover:bg-muted transition cursor-pointer">
              <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          {/* Details */}
          <div className="border-t border-border pt-6 space-y-3">
            <h3 className="font-semibold text-sm">Crafted with</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {product.details.map(d => <li key={d} className="flex gap-2"><span className="text-cognac">·</span>{d}</li>)}
            </ul>
          </div>

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection reviews={reviews} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
