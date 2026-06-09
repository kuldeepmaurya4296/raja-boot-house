"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/modules/admin/shared/components/DataTable";
import { formatINR, formatDate } from "@/lib/format";
import { Package, Heart, MapPin, ArrowRight, IndianRupee } from "lucide-react";

export default function AccountOverview() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/api/user/profile").then(res => {
        if (!res.ok) throw new Error("Failed to load profile data");
        return res.json();
      }),
      fetch("/api/orders").then(res => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
    ])
      .then(([profileData, ordersData]) => {
        if (profileData.success) {
          setStats(profileData.stats);
        }
        if (Array.isArray(ordersData)) {
          setRecentOrders(ordersData.slice(0, 3));
        }
      })
      .catch(err => {
        console.error("Overview page error:", err);
        setError("Something went wrong while loading your dashboard statistics.");
      })
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-[96px]"></div>
          ))}
        </div>
        <div>
          <div className="h-6 w-32 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 h-[88px]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        <p className="text-sm font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs underline font-semibold cursor-pointer"
        >
          Try reloading the page
        </button>
      </div>
    );
  }

  const statItems = [
    { label: "Total orders", value: stats?.totalOrders ?? 0, icon: Package },
    { label: "Total spent", value: formatINR(stats?.totalSpent ?? 0), icon: IndianRupee },
    { label: "Saved addresses", value: stats?.savedAddressesCount ?? 0, icon: MapPin },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-4">
        {statItems.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                <p className="font-serif text-2xl font-bold mt-2">{s.value}</p>
              </div>
              <div className="bg-primary/5 p-2 rounded-lg text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-serif text-2xl font-bold">Recent orders</h2>
          {recentOrders.length > 0 && (
            <Link href="/account/orders" className="text-sm font-semibold underline">
              View all
            </Link>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
            <p className="text-sm font-medium">You haven't placed any orders yet.</p>
            <Link href="/shop" className="mt-3 inline-block bg-primary text-primary-foreground px-5 py-2 rounded-full text-xs font-semibold">
              Browse shoes
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map(o => {
              const firstItem = o.items?.[0];
              return (
                <Link key={o._id || o.id} href="/account/orders" className="block bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary transition">
                  {firstItem?.image ? (
                    <img src={firstItem.image} alt={firstItem.name} className="h-14 w-14 rounded-lg object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{o.orderId}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(o.createdAt)} · {o.items?.length || 0} {o.items?.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatINR(o.pricing?.total || o.total || 0)}</p>
                    <ArrowRight className="h-4 w-4 ml-auto mt-1 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

