"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export function NewsletterFormClient() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <form className="mt-6 flex max-w-md mx-auto gap-2 relative" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3.5 rounded-full border border-input bg-card text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary outline-none text-foreground"
        required
      />
      <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-xs font-semibold whitespace-nowrap hover:opacity-95 transition cursor-pointer">
        Subscribe
      </button>
    </form>
  );
}
