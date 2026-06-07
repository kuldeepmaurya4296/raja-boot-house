import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-boots.jpg";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-12 md:pb-24 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="space-y-6 md:space-y-8">
          <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-cognac font-semibold border border-cognac/30 rounded-full px-3 py-1">
            Spring · Summer 2026
          </span>
          <h1 className="font-serif text-[44px] leading-[1.02] md:text-7xl md:leading-[0.95] font-bold text-charcoal text-balance">
            Boots made the<br />
            <span className="italic text-primary">old way.</span>
            <br />Built to outlive trends.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-md">
            Fifty years of cobbler-grade craft. Hand-cut leather, Goodyear-welted soles, and a fit that softens into you.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition group cursor-pointer">
              Shop the collection <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/shop" className="text-sm font-semibold underline underline-offset-4 decoration-cognac/40 hover:decoration-cognac cursor-pointer">Our story</Link>
          </div>
          <div className="flex gap-8 pt-4 border-t border-border">
            <div><div className="font-serif text-2xl font-bold text-primary">50+</div><div className="text-xs text-muted-foreground uppercase tracking-wide">Years of craft</div></div>
            <div><div className="font-serif text-2xl font-bold text-primary">28K</div><div className="text-xs text-muted-foreground uppercase tracking-wide">Pairs shipped</div></div>
            <div><div className="font-serif text-2xl font-bold text-primary">4.9★</div><div className="text-xs text-muted-foreground uppercase tracking-wide">Avg. rating</div></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: "easeOut" }} className="relative">
          <div className="aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden shadow-elevated">
            <img src={heroImg.src} alt="Raja Boot House heritage workshop" width={1600} height={1200} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-5 -left-5 md:bottom-6 md:left-6 bg-cream border border-border rounded-xl shadow-card px-4 py-3 max-w-[220px]">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Featured</div>
            <div className="font-serif font-bold text-sm mt-1">Raja Oxblood Chelsea</div>
            <div className="text-xs text-primary font-semibold mt-1">From ₹24,276</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
