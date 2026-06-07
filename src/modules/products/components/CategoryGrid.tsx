import Link from "next/link";
import { motion } from "framer-motion";
import { categories } from "@/data/categories";

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold mb-2">Browse</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-charcoal">By Silhouette</h2>
        </div>
        <Link href="/shop" className="hidden md:inline text-sm font-semibold underline underline-offset-4 cursor-pointer">View all</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {categories.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}>
            <Link href="/shop" className="block group cursor-pointer">
              <div className="aspect-[4/5] md:aspect-[3/4] rounded-xl bg-gradient-to-br from-muted via-secondary to-cream relative overflow-hidden border border-border">
                <div className="absolute inset-0 grain opacity-50" />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                  <h3 className="font-serif text-lg md:text-2xl font-bold text-charcoal">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.productCount} styles</p>
                </div>
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-charcoal text-cream grid place-items-center text-xs group-hover:bg-primary transition">→</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
