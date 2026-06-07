"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function SignupPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-md">
      <div className="text-center mb-8">
        <Logo size={56} />
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
        <h1 className="font-serif text-3xl font-bold text-center">Join the house</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Create your account</p>
        <form className="mt-6 space-y-4" onSubmit={e => e.preventDefault()}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full name</span>
            <input className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
            <input type="email" className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</span>
            <input type="password" className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
          <button className="w-full bg-primary text-primary-foreground rounded-full py-3 font-semibold text-sm cursor-pointer">Create account</button>
        </form>
        <p className="text-xs text-center mt-5 text-muted-foreground">
          Already a member? <Link href="/login" className="text-primary font-semibold underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
