"use client";

import Link from "next/link";
import { currentUser } from "@/data/users";
import { ordersByUser } from "@/data/orders";
import { StatusBadge } from "@/components/dashboard/DataTable";
import { formatINR, formatDate } from "@/lib/format";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";

export default function AccountOverview() {
  const orders = ordersByUser(currentUser.id).slice(0, 3);
  const stats = [
    { label: "Total orders", value: currentUser.orders, icon: Package },
    { label: "Total spent", value: formatINR(currentUser.totalSpent), icon: Heart },
    { label: "Saved address", value: currentUser.addresses.length, icon: MapPin },
  ];
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="font-serif text-2xl font-bold mt-2">{s.value}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-serif text-2xl font-bold">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-semibold underline">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {orders.map(o => (
            <Link key={o.id} href="/account/orders" className="block bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary transition">
              <img src={o.items[0].image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{o.number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(o.createdAt)} · {o.items.length} item</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatINR(o.total)}</p>
                <ArrowRight className="h-4 w-4 ml-auto mt-1 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
