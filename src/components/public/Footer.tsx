import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream/90 mt-20 hidden md:block">
      <div className="container mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <Logo size={44} />
          <p className="mt-4 text-sm text-cream/60 max-w-xs">Footwear retail brand established in 2025 by the Gupta brothers. Offering a wide range of footwear from reputed brands like Lakhani, Touch, Paragon, and Goldstar for all age groups.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link href="/shop">All Boots</Link></li>
            <li><Link href="/shop">Chelsea</Link></li>
            <li><Link href="/shop">Work</Link></li>
            <li><Link href="/shop">Women's</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>Our story</li><li>Atelier</li><li>Press</li><li>Careers</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider">Help</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>Shipping</li><li>Returns</li><li>Sizing</li><li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container mx-auto px-6 py-5 text-xs text-cream/50 flex justify-between">
          <span>© 1972–2026 Raja Boot House. All rights reserved.</span>
          <span>Made in Mumbai</span>
        </div>
      </div>
    </footer>
  );
}
