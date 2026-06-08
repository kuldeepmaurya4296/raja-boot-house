"use client";

import Link from "next/link";
import { Hero } from "@/components/public/Hero";
import { CategoryGrid } from "@/modules/products/components/CategoryGrid";
import { ProductCard } from "@/modules/products/components/ProductCard";

import { motion } from "framer-motion";
import { Truck, Award, RotateCcw, ShieldCheck, Calendar, Heart, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import occImg1 from "@/assets/product-1.jpg";
import occImg2 from "@/assets/product-2.jpg";
import occImg3 from "@/assets/product-3.jpg";
import occImg4 from "@/assets/product-6.jpg";

const BRANDS = [
  "Lakhani",
  "Touch Footwear",
  "Paragon",
  "Goldstar Shoes",
  "Raja Exclusive",
  "Touch Heels",
  "Lakhani Canvas",
  "Paragon Comfort",
];

const OCCASIONS = [
  {
    name: "Wedding & Bridal",
    desc: "Dulha-Dulhan specialty embroidery jootis & high heels.",
    image: occImg1.src,
    occasionKey: "Wedding",
    badge: "Specialty",
  },
  {
    name: "Party & Festive",
    desc: "Polished leather dress shoes and elegant block heels.",
    image: occImg2.src,
    occasionKey: "Party",
    badge: "Formal",
  },
  {
    name: "Daily & Comfort",
    desc: "Ultra-comfortable flats, doctor slippers, and chappals.",
    image: occImg3.src,
    occasionKey: "Daily",
    badge: "Casual",
  },
  {
    name: "Active & Sports",
    desc: "Goldstar school shoes, Lakhani runners, and velcro sandals.",
    image: occImg4.src,
    occasionKey: "Sports",
    badge: "Performance",
  },
];

export default function Home() {
  const [productList, setProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load products from API
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
      <section className="bg-charcoal text-cream overflow-hidden py-8 lg:py-10 relative">
        <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-charcoal to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-charcoal to-transparent z-10 pointer-events-none" />
        
        <div className="text-center mb-6">
          <p className="text-[10px] uppercase tracking-[0.35em] text-brass/80 font-bold">Authorized Distribution</p>
        </div>
        
        <div className="flex w-full overflow-hidden">
          <motion.div
            className="flex gap-20 whitespace-nowrap text-xl md:text-2xl font-serif font-semibold italic text-cream/70 shrink-0"
            animate={{ x: [0, -1200] }}
            transition={{
              repeat: Infinity,
              duration: 35,
              ease: "linear",
            }}
          >
            {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
              <span key={i} className="flex items-center gap-2 select-none hover:text-brass transition">
                <Sparkles className="h-4 w-4 text-brass shrink-0" />
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

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
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[4/5] bg-muted rounded-xl"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
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
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24 bg-cream/40 border-y border-border/80">
        <div className="max-w-2xl mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-bold mb-2">Collections</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal">Curated By Occasion</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Footwear designed specifically for special Indian wedding events, corporate environments, daily errands, and school/sports activities.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OCCASIONS.map((occ, i) => (
            <motion.div
              key={occ.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-card transition flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img src={occ.image} alt={occ.name} className="h-full w-full object-cover hover:scale-105 transition duration-500" />
                <span className="absolute top-3 right-3 bg-cream/90 text-cognac border border-brass/25 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                  {occ.badge}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">{occ.name}</h3>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{occ.desc}</p>
                </div>
                <Link
                  href={`/shop?occasion=${occ.occasionKey}`}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  View styles <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Editorial split */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-charcoal to-charcoal/90 text-cream p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center overflow-hidden relative border border-border/10 shadow-elevated"
        >
          <div className="absolute inset-0 grain opacity-20" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.3em] text-brass font-bold mb-3">Gupta Brothers Enterprise</p>
            <h3 className="font-serif text-3xl md:text-5xl font-bold leading-tight">
              Quality footwear<br />
              <em className="text-brass not-italic">for all demographics.</em>
            </h3>
            <p className="mt-5 text-cream/70 text-sm leading-relaxed max-w-md">
              Raja Boot House has been a retail staple since 2025 under the stewardship of Prince and Bipin Gupta. We offer hand-finished design profiles, bridal/groom wedding accessories, and durability guaranteed by India's biggest national brands.
            </p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-2 bg-cream text-charcoal px-6 py-3.5 rounded-full text-xs font-bold hover:bg-cream/90 transition">
              Explore Catalog <ArrowRight className="h-3.5 w-3.5" />
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
                className={`rounded-lg object-cover aspect-square border border-border/10 ${i % 2 ? "translate-y-6" : ""}`}
              />
            ))}
          </div>
        </motion.div>
      </section>

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
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-[4/5] bg-muted rounded-xl"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
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
          <form className="mt-6 flex max-w-md mx-auto gap-2 relative" onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you for subscribing to our newsletter!");
          }}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3.5 rounded-full border border-input bg-card text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary outline-none"
              required
            />
            <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-xs font-semibold whitespace-nowrap hover:opacity-95 transition cursor-pointer">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
