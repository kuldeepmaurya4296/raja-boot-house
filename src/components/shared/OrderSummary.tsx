import { formatINR } from "@/lib/format";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  actionButton?: React.ReactNode;
}

export function OrderSummary({ subtotal, shipping, tax, actionButton }: OrderSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="font-serif text-xl font-bold">Order Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (est.)</span>
          <span>{formatINR(tax)}</span>
        </div>
      </div>
      <div className="border-t border-border pt-4 flex justify-between font-semibold">
        <span>Total</span>
        <span className="font-serif text-xl">{formatINR(subtotal + shipping + tax)}</span>
      </div>
      {actionButton}
    </div>
  );
}
