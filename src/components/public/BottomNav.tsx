"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-store";

type Item = { href: string; label: string; icon: typeof Home; exact?: boolean; badge?: boolean };
const items: Item[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/shop", label: "Shop", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, badge, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={label} href={href} className="flex flex-col items-center justify-center gap-1 py-2.5 relative cursor-pointer">
              <div className={`relative ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {badge && count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">{count}</span>
                )}
              </div>
              <span className={`text-[10px] tracking-wide ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{label}</span>
              {active && <span className="absolute top-0 h-0.5 w-8 bg-primary rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
