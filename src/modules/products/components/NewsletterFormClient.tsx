"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export function NewsletterFormClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      toast.success(data.message || "Thank you for subscribing to our newsletter!");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-6 flex flex-col sm:flex-row max-w-md mx-auto gap-2.5 relative" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3.5 rounded-full border border-input bg-card text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary outline-none text-foreground w-full"
        required
        disabled={loading}
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-primary text-primary-foreground px-6 py-3.5 rounded-full text-xs font-semibold whitespace-nowrap hover:opacity-95 transition cursor-pointer w-full sm:w-auto disabled:opacity-75 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
            Subscribing...
          </>
        ) : (
          "Subscribe"
        )}
      </button>
    </form>
  );
}
