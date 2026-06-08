"use client";

import Link from "next/link";
import { useCart, lineKey } from "@/lib/cart-store";
import { CartItemRow } from "@/modules/cart/components/CartItemRow";
import { EmptyCartState } from "@/modules/cart/components/EmptyCartState";
import { OrderSummary } from "@/components/shared/OrderSummary";

import { useSettings } from "@/lib/settings-context";

export default function CartPage() {
  const { lines, remove, setQty, subtotal } = useCart();
  const settings = useSettings();
  const shipping = 0;
  const tax = Math.round(subtotal * (settings.taxRate / 100));

  if (lines.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <h1 className="font-serif text-3xl md:text-5xl font-bold mb-8">Your bag</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {lines.map(l => {
            const k = lineKey(l);
            return (
              <CartItemRow
                key={k}
                item={l}
                lineKey={k}
                onRemove={remove}
                onQtyChange={setQty}
              />
            );
          })}
        </div>
        <aside className="h-fit sticky top-24">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            actionButton={
              <div className="space-y-3">
                <Link href="/checkout" className="block w-full bg-primary text-primary-foreground rounded-full py-3 text-center font-semibold hover:opacity-95 transition">
                  Checkout
                </Link>
                <Link href="/shop" className="block text-center text-sm text-muted-foreground underline">
                  Continue shopping
                </Link>
              </div>
            }
          />
        </aside>
      </div>
    </div>
  );
}
