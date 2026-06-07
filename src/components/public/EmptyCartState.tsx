import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export function EmptyCartState() {
  return (
    <div className="container mx-auto px-4 py-20 text-center max-w-md">
      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
      <h1 className="font-serif text-3xl font-bold mt-4">Your bag is empty</h1>
      <p className="text-muted-foreground mt-2">Let's fix that.</p>
      <Link
        href="/shop"
        className="mt-6 inline-block bg-primary text-primary-foreground rounded-full px-6 py-3 font-semibold text-sm hover:opacity-95 transition cursor-pointer"
      >
        Browse boots
      </Link>
    </div>
  );
}
