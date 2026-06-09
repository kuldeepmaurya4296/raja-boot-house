import { formatINR } from "@/lib/format";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  couponDiscount?: number;
  couponCode?: string;
  actionButton?: React.ReactNode;
}

export function OrderSummary({ subtotal, shipping, tax, couponDiscount = 0, couponCode, actionButton }: OrderSummaryProps) {
  const cgst = Math.round(tax / 2);
  const sgst = tax - cgst;
  const finalTotal = Math.max(0, subtotal + shipping + tax - couponDiscount);

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
          <span className="text-muted-foreground">CGST (4%)</span>
          <span>{formatINR(cgst)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">SGST (4%)</span>
          <span>{formatINR(sgst)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Discount {couponCode ? `(${couponCode})` : ""}</span>
            <span>-{formatINR(couponDiscount)}</span>
          </div>
        )}
      </div>
      <div className="border-t border-border pt-4 flex justify-between font-semibold">
        <span>Total</span>
        <span className="font-serif text-xl">{formatINR(finalTotal)}</span>
      </div>
      {actionButton}
    </div>
  );
}
