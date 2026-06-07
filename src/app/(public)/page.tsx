"use client";
import Link from "next/link";
import { Hero } from "@/components/public/Hero";
import { CategoryGrid } from "@/modules/products/components/CategoryGrid";
import { ProductCard } from "@/modules/products/components/ProductCard";
import { featuredProducts, products as mockProducts } from "@/data/products";
import { motion } from "framer-motion";
import { Truck, Award, RotateCcw, Hammer } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductList(data);
        }
      })
      .catch((err) => console.error("Error loading homepage products:", err))
      .finally(() => setLoading(false));
  }, []);

  const featured = productList.length > 0 
    ? productList.filter((p) => p.isFeatured).slice(0, 4)
    : featuredProducts();

  const newest = productList.length > 0
    ? [...productList].slice(0, 4)
    : [...mockProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <>
      <Hero />

      {/* Trust strip */}
      <section className="border-y border-border bg-cream/60">
        <div className="container mx-auto px-4 md:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
          {[
            { icon: Award, t: "Reputed Brands", s: "Lakhani, Touch, Paragon, Goldstar" },
            { icon: Hammer, t: "Gupta Brothers", s: " Prince & Bipin Gupta" },
            { icon: Truck, t: "Free shipping", s: "Over ₹2000" },
            { icon: RotateCcw, t: "Quality footwear", s: "For men, women & kids" },
          ].map(({ icon: I, t, s }) => (
            <div key={t} className="flex items-center gap-3 justify-center md:justify-start">
              <I className="h-5 w-5 text-cognac" />
              <div className="text-left">
                <div className="text-sm font-semibold">{t}</div>
                <div className="text-[11px] text-muted-foreground">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CategoryGrid />

      {/* Featured */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-2">The Atelier</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold">Bestsellers</h2>
          </div>
          <Link href="/shop" className="hidden md:inline text-sm font-semibold underline underline-offset-4">
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-charcoal to-charcoal/90 text-cream p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center overflow-hidden relative"
        >
          <div className="absolute inset-0 grain opacity-20" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.3em] text-brass font-semibold mb-3">Gupta Brothers Enterprise</p>
            <h3 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
              Quality footwear<br />
              <em className="text-brass not-italic">for every occasion.</em>
            </h3>
            <p className="mt-5 text-cream/70 max-w-md">
              Established in 2025 by Prince Gupta and Bipin Gupta, Raja Boot House offers premium, comfortable sandals, shoes, slippers, and special wedding footwear for all age groups.
            </p>
            <Link href="/shop" className="mt-7 inline-flex bg-cream text-charcoal px-6 py-3 rounded-full text-sm font-semibold">
              Explore catalog
            </Link>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            {newest.slice(0, 4).map((p, i) => (
              <motion.img
                key={p.id}
                src={p.image}
                alt={p.name}
                loading="lazy"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-lg object-cover aspect-square ${i % 2 ? "translate-y-6" : ""}`}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* New arrivals */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-2">Fresh from the bench</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold">New arrivals</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {newest.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="bg-cream border border-border rounded-2xl p-8 md:p-14 text-center max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-3">The Atelier Letter</p>
          <h3 className="font-serif text-3xl md:text-4xl font-bold">Drops, stories, the occasional discount.</h3>
          <form className="mt-6 flex max-w-md mx-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-full border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
