"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { products } from "@/data/products";
import { ProductCard } from "@/components/public/ProductCard";
import { Heart } from "lucide-react";

export default function AccountWishlistPage() {
  const { wishlist } = useCart();
  const items = products.filter(p => wishlist.includes(p.id));
  return (
    <div>
      <h2 className="font-serif text-2xl font-bold mb-6">Wishlist</h2>
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <Heart className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="mt-3 font-semibold">No saved boots yet</p>
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
