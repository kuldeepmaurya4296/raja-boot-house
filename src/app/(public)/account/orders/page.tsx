"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/modules/admin/shared/components/DataTable";
import { formatINR, formatDate } from "@/lib/format";
import Link from "next/link";

export default function AccountOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/orders?userId=${session.user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  if (loading) {
    return <div className="py-10">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold">My orders</h2>
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold inline-block">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl font-bold">My orders</h2>
      {orders.map(o => (
        <div key={o._id || o.id} className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <p className="font-semibold">{o.orderId || o.number}</p>
              <p className="text-xs text-muted-foreground">Placed {formatDate(o.createdAt)}</p>
            </div>
            <StatusBadge status={o.status} />
            <p className="font-serif font-bold">{formatINR(o.pricing?.total || o.total)}</p>
          </div>
          <div className="pt-4 space-y-3">
            {o.items.map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{it.name}</p>
                  <p className="text-xs text-muted-foreground">Size {it.size} · {it.color} · ×{it.quantity || it.qty}</p>
                </div>
                <p className="text-sm font-semibold">{formatINR(it.price * (it.quantity || it.qty))}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
