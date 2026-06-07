"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-md">
      <div className="text-center mb-8">
        <Logo size={56} />
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
        <h1 className="font-serif text-3xl font-bold text-center">Welcome back</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Sign in to your account</p>
        <form className="mt-6 space-y-4" onSubmit={e => e.preventDefault()}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
            <input type="email" defaultValue="aarav@example.com" className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</span>
            <input type="password" defaultValue="••••••••" className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <button className="w-full bg-primary text-primary-foreground rounded-full py-3 font-semibold text-sm cursor-pointer">Sign in</button>
        </form>
        <p className="text-xs text-center mt-5 text-muted-foreground">
          New here? <Link href="/signup" className="text-primary font-semibold underline">Create an account</Link>
        </p>
      </div>
      <div className="mt-6 flex justify-center gap-4 text-xs">
        <Link href="/account" className="underline">Customer portal</Link>
        <Link href="/admin" className="underline">Admin</Link>
        <Link href="/vendor" className="underline">Vendor</Link>
      </div>
    </div>
  );
}
