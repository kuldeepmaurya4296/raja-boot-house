"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatINR } from "@/lib/format";
import { useState } from "react";

// Shared and sub-components
import { OrderSummary } from "@/components/shared/OrderSummary";
import { CheckoutStepsHeader } from "@/components/public/CheckoutStepsHeader";
import { AddressFormStep } from "@/components/public/AddressFormStep";
import { ShippingMethodStep } from "@/components/public/ShippingMethodStep";
import { PaymentFormStep } from "@/components/public/PaymentFormStep";
import { OrderConfirmation } from "@/components/public/OrderConfirmation";

export default function CheckoutPage() {
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [done, setDone] = useState(false);
  const shipping = 0;
  const tax = Math.round(subtotal * 0.08);

  if (lines.length === 0 && !done) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Your bag is empty.</p>
        <Link href="/shop" className="underline font-semibold text-primary">
          Shop now
        </Link>
      </div>
    );
  }

  if (done) {
    return <OrderConfirmation />;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2">Checkout</h1>
      
      {/* Wizard Steps Header */}
      <CheckoutStepsHeader step={step} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 md:p-8 space-y-5 shadow-sm">
          {step === 1 && <AddressFormStep />}
          {step === 2 && <ShippingMethodStep />}
          {step === 3 && <PaymentFormStep />}
          
          <div className="flex justify-between pt-4 border-t border-border mt-6">
            <button
              disabled={step === 1}
              onClick={() => setStep(((step - 1) || 1) as 1 | 2 | 3)}
              className="text-sm font-semibold disabled:opacity-30 px-4 py-2 hover:bg-muted rounded-full transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => (step < 3 ? setStep((step + 1) as 1 | 2 | 3) : (clear(), setDone(true)))}
              className="bg-primary text-primary-foreground rounded-full px-7 py-3 text-sm font-semibold hover:opacity-95 transition cursor-pointer"
            >
              {step < 3 ? "Continue" : "Place order"}
            </button>
          </div>
        </div>
        <aside className="h-fit">
          <OrderSummary
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            actionButton={
              <div className="border-t border-border pt-4 mt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Items ({lines.length})
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {lines.map(l => (
                    <div key={l.productId + l.size + l.color} className="flex gap-3 text-sm">
                      <img src={l.image} alt="" className="h-12 w-12 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-tight truncate">{l.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">×{l.quantity} · {l.size}</div>
                      </div>
                      <div className="font-semibold">{formatINR(l.price * l.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </aside>
      </div>
    </div>
  );
}
