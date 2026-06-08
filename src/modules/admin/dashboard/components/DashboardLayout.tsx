"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/shared/Logo";
import { Menu, X, Bell, ChevronDown, LogOut, ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function DashboardLayout({
  items,
  title,
  accent = "primary",
  children,
}: {
  items: NavItem[];
  title: string;
  accent?: "primary" | "accent";
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-sidebar-border">
          <Logo size={32} />
          <button className="lg:hidden p-1" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pt-5 pb-3">
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
            {title}
          </div>
        </div>
        <nav className="px-3 space-y-0.5">
          {items.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? path === to : path === to || path.startsWith(to + "/");
            const activeStyles =
              accent === "accent"
                ? "bg-sidebar-accent text-accent font-semibold"
                : "bg-sidebar-accent text-brass font-semibold";
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? activeStyles
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-sidebar-border flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-red-400 text-left w-full cursor-pointer transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-lg md:text-xl font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
            </button>
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                RB
              </div>
              <span className="hidden md:inline text-sm font-medium">Logout</span>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function DashboardPage({
  children,
  eyebrow,
  title,
  action,
}: {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {(eyebrow || title || action) && (
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {eyebrow && (
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="font-serif text-2xl md:text-3xl font-bold">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
