import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";
import { QuantitySelector } from "@/components/shared/QuantitySelector";

interface CartItemRowProps {
  item: {
    productId: string;
    slug: string;
    name: string;
    size: number;
    color: string;
    price: number;
    image: string;
    quantity: number;
  };
  lineKey: string;
  onRemove: (key: string) => void;
  onQtyChange: (key: string, qty: number) => void;
}

export function CartItemRow({ item, lineKey, onRemove, onQtyChange }: CartItemRowProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex gap-4 shadow-sm">
      <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div>
            <Link
              href={`/shop/${item.slug}`}
              className="font-serif font-semibold hover:underline text-base md:text-lg cursor-pointer"
            >
              {item.name}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">
              Size {item.size} · {item.color}
            </p>
          </div>
          <button
            onClick={() => onRemove(lineKey)}
            className="text-muted-foreground hover:text-destructive p-1 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex justify-between items-end">
          <QuantitySelector
            quantity={item.quantity}
            onChange={(q) => onQtyChange(lineKey, q)}
            size="sm"
          />
          <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
