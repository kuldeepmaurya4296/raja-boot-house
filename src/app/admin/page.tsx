"use client";

import { useEffect, useState } from "react";
import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { StatCard } from "@/modules/admin/dashboard/components/StatCard";
import { DataTable, StatusBadge, type Column } from "@/modules/admin/shared/components/DataTable";
import { ShoppingCart, IndianRupee, Users, Package, AlertTriangle } from "lucide-react";
import { formatINR, formatDate, formatNumber } from "@/lib/format";
import { SalesChart } from "@/modules/admin/dashboard/components/SalesChart";
import { TopProductsList } from "@/modules/admin/dashboard/components/TopProductsList";

const cols: Column<any>[] = [
  { key: "orderId", header: "Order", render: o => <span className="font-semibold text-sm">{o.orderId || o.number}</span> },
  { key: "customerName", header: "Customer", render: o => <span className="text-sm">{o.customerName || "—"}</span> },
  { key: "createdAt", header: "Date", render: o => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
  { key: "status", header: "Status", render: o => <StatusBadge status={o.status} /> },
  { key: "total", header: "Total", render: o => <span className="font-semibold">{formatINR(o.total)}</span>, className: "text-right" },
];

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard metrics", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardPage eyebrow="Overview" title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardPage>
    );
  }

  const {
    revenue = 0,
    ordersCount = 0,
    customersCount = 0,
    productsCount = 0,
    salesChart = { data: [0], labels: [""] },
    latestOrders = [],
    topProducts = [],
    lowStockAlerts = [],
  } = stats || {};

  return (
    <DashboardPage eyebrow="Today" title="Overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatINR(revenue)} delta={stats?.revenueDelta ?? 0} icon={IndianRupee} tint="primary" />
        <StatCard label="Orders" value={formatNumber(ordersCount)} delta={stats?.ordersDelta ?? 0} icon={ShoppingCart} tint="accent" />
        <StatCard label="Customers" value={formatNumber(customersCount)} delta={stats?.customersDelta ?? 0} icon={Users} tint="brass" />
        <StatCard label="Products" value={formatNumber(productsCount)} delta={stats?.productsDelta ?? 0} icon={Package} tint="muted" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-serif font-bold text-lg mb-1">Sales this week</h3>
          <p className="text-xs text-muted-foreground mb-6">Daily revenue, last 7 days</p>
          <SalesChart data={salesChart.data} labels={salesChart.labels} />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">Top products</h3>
            <TopProductsList products={topProducts} />
          </div>
          {lowStockAlerts.length > 0 && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3 text-red-700">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Low Stock Alert</p>
                <p className="text-[10px] text-red-600">
                  {lowStockAlerts.length} items running low on inventory.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-serif text-lg font-bold">Latest orders</h3>
        </div>
        <DataTable columns={cols} rows={latestOrders} />
      </div>
    </DashboardPage>
  );
}

