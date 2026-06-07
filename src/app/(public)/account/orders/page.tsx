"use client";

import { currentUser } from "@/data/users";
import { ordersByUser } from "@/data/orders";
import { StatusBadge } from "@/modules/admin/shared/components/DataTable";
import { formatINR, formatDate } from "@/lib/format";

export default function AccountOrdersPage() {
  const orders = ordersByUser(currentUser.id);
  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">My orders</h2>
      {orders.map(o => (
        <div key={o.id} className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <p className="font-semibold">{o.number}</p>
              <p className="text-xs text-muted-foreground">Placed {formatDate(o.createdAt)}</p>
            </div>
            <StatusBadge status={o.status} />
            <p className="font-serif font-bold">{formatINR(o.total)}</p>
          </div>
          <div className="pt-4 space-y-3">
            {o.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Size {it.size} · {it.color} · ×{it.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatINR(it.price * it.quantity)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
