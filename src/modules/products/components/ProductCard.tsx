"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { wishlist, toggleWish } = useCart();
  const wished = wishlist.includes(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <motion.img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {product.badge && (
            <span
              className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                product.badge === "sale"
                  ? "bg-destructive text-destructive-foreground"
                  : product.badge === "new"
                    ? "bg-accent text-accent-foreground"
                    : "bg-charcoal text-cream"
              }`}
            >
              {product.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWish(product.id);
            }}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-cream/90 backdrop-blur grid place-items-center hover:bg-cream transition"
            aria-label="Wishlist"
          >
            <Heart
              className={`h-4 w-4 transition ${wished ? "fill-primary text-primary" : "text-charcoal"}`}
            />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
          <h3 className="font-serif text-base font-medium text-foreground leading-snug">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">{formatINR(product.price)}</span>
            {product.compareAt && (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(product.compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
