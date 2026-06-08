"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, MapPin, Settings, LogOut } from "lucide-react";
import { currentUser } from "@/data/users";
import { signOut } from "next-auth/react";

const items = [
  { href: "/account", label: "Overview", icon: User, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: Settings },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="grid md:grid-cols-4 gap-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-cognac font-semibold">My account</p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold mt-2">Hello, {currentUser.name.split(" ")[0]}</h1>
      </div>
      <div className="grid lg:grid-cols-[240px_1fr] gap-6 md:gap-10">
        <aside>
          <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-hide md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0">
            {items.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/account";
              return (
                <Link key={href} href={href} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}>
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap text-foreground hover:bg-red-50 hover:text-red-600 text-left w-full cursor-pointer transition-colors mt-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
