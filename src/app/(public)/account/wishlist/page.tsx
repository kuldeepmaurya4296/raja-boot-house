"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import { ProductCard } from "@/modules/products/components/ProductCard";
import { Heart } from "lucide-react";

export default function AccountWishlistPage() {
  const { wishlist } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      wishlist.map(id => fetch(`/api/products/${id}`).then(res => res.json()))
    ).then(results => {
      setItems(results.filter(p => p && !p.error));
    }).finally(() => setLoading(false));
  }, [wishlist]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <h2 className="font-serif text-2xl font-bold mb-6">Wishlist</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-[4/5] bg-muted rounded-xl"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">Wishlist</h2>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 font-semibold">No saved products yet</p>
          <p className="text-sm text-muted-foreground mt-1">Tap the heart icon on any product to save it here.</p>
          <Link href="/shop" className="mt-5 inline-block bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold">
            Browse shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
