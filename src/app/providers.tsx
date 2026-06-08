"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/lib/cart-store";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { SettingsProvider } from "@/lib/settings-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <CartProvider>{children}</CartProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

