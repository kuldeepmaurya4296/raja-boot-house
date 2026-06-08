"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Logo } from "@/components/shared/Logo";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("aarav@example.com");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error || "Invalid login credentials");
      } else {
        toast.success("Signed in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24 max-w-md">
      <div className="text-center mb-8">
        <Logo size={56} />
      </div>
      <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
        <h1 className="font-serif text-3xl font-bold text-center">Welcome back</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Sign in to your account</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-full py-3 font-semibold text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-4 text-muted-foreground text-xs uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-background border border-input text-foreground hover:bg-muted rounded-full py-3 font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.355-2.845-6.355-6.355s2.845-6.355 6.355-6.355c1.61 0 3.076.61 4.205 1.61l3.143-3.143C19.305 2.228 15.98 1 12.24 1 5.92 1 1 5.92 1 12.24S5.92 23.48 12.24 23.48c5.688 0 10.286-4.6 10.286-10.286 0-.663-.06-1.32-.177-1.909H12.24z"
            />
          </svg>
          Sign in with Google
        </button>

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

export default function LoginPage() {
  const { status } = useSession();

  if (status === "authenticated") {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="mb-4">You are already logged in.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
