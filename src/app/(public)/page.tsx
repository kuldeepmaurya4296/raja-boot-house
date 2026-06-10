import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { OCCASIONS } from "@/data/occasions";
import { Hero } from "@/components/public/Hero";
import { CategoryGrid } from "@/modules/products/components/CategoryGrid";
import { ProductCard } from "@/modules/products/components/ProductCard";
import { BrandMarquee, OccasionGrid, EditorialBanner } from "@/modules/products/components/HomeAnimations";
import { NewsletterFormClient } from "@/modules/products/components/NewsletterFormClient";
import { Award, ShieldCheck, Truck, RotateCcw, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Raja Boot House — Handcrafted Leather Boots & Premium Footwear",
  description: "Handcrafted luxury footwear and premium Indian leather craftsmanship since 1972. Explore men's, women's, sports, and bridal collections.",
  openGraph: {
    title: "Raja Boot House — Handcrafted Premium Footwear",
    description: "Explore handcrafted luxury footwear and leather designs since 1972.",
    images: [{ url: "/assets/hero-boots.jpg" }]
  }
};

async function getHomepageData() {
  try {
    const { isReady } = await ensureDbReady();
    if (!isReady) {
      console.warn("Database connection is not ready. Returning empty homepage product list.");
      return [];
    }
    const rawProducts = await Product.find({ isActive: true }).populate({ path: "category", model: Category }).sort({ createdAt: -1 });
    return rawProducts.map((p: any) => normalizeProduct(p));
  } catch (err) {
    console.error("Failed to load homepage data:", err);
    return [];
  }
}

export default async function Home() {
  const productList = await getHomepageData();

  const featured = productList.filter((p) => p.badge === "bestseller" || p.badge === "new").slice(0, 4);
  const newest = [...productList].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 4);

  return (
    <>
      <Hero />

      {/* Trust Badges section */}
      <section className="border-y border-border bg-cream/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
          {[
            { icon: Award, t: "Official Retailer", s: "Lakhani, Touch, Paragon, Goldstar" },
            { icon: ShieldCheck, t: "Gupta Brothers Craft", s: "Since 1972 quality assurance" },
            { icon: Truck, t: "Free Shipping", s: "Orders above ₹2000" },
            { icon: RotateCcw, t: "Simple Exchanges", s: "Within 30 days hassle-free" },
          ].map(({ icon: I, t, s }) => (
            <div key={t} className="flex items-center gap-3 justify-center md:justify-start">
              <I className="h-5 w-5 text-cognac" />
              <div className="text-left">
                <div className="text-sm font-semibold text-charcoal">{t}</div>
                <div className="text-[11px] text-muted-foreground">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dynamic Silhouettes Categories */}
      <CategoryGrid />

      {/* Brand Logos Infinite sliding Marquee */}
      <BrandMarquee />

      {/* Bestsellers Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-2">The Atelier</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal">Bestsellers</h2>
          </div>
          <Link href="/shop" className="hidden md:inline text-sm font-semibold underline underline-offset-4 hover:text-primary transition">
            Shop all
          </Link>
        </div>
        
        {productList.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Couldn't load featured products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Occasion-based collections Showcase Grid */}
      <OccasionGrid occasions={OCCASIONS} />

      {/* Brand Editorial split */}
      <EditorialBanner newest={newest} />

      {/* New Arrivals Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-2">Fresh from the bench</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal">New arrivals</h2>
          </div>
          <Link href="/shop" className="hidden md:inline text-sm font-semibold underline underline-offset-4 hover:text-primary transition">
            Shop all
          </Link>
        </div>
        
        {productList.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-border rounded-xl">
            <p className="text-sm text-muted-foreground">Couldn't load new arrivals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newest.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Premium Newsletter Sign-up */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <div className="bg-cream border border-border rounded-2xl p-8 md:p-14 text-center max-w-3xl mx-auto shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 grain opacity-20" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-3 relative">The Atelier Letter</p>
          <h3 className="font-serif text-3xl md:text-4xl font-bold text-charcoal relative">Drops, stories, the occasional discount.</h3>
          <NewsletterFormClient />
        </div>
      </section>
    </>
  );
}
