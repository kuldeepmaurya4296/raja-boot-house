"use client";

import { DashboardPage } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { orders } from "@/data/orders";
import { customers } from "@/data/users";
import { products } from "@/data/products";
import { ShoppingCart, IndianRupee, Users, Package } from "lucide-react";
import { formatINR, formatDate, formatNumber } from "@/lib/format";
import type { Order } from "@/data/orders";

// Sub-components
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProductsList } from "@/components/dashboard/TopProductsList";

const revenue = orders.reduce((s, o) => s + o.total, 0);

const cols: Column<Order>[] = [
  { key: "n", header: "Order", render: o => <span className="font-semibold text-sm">{o.number}</span> },
  { key: "c", header: "Customer", render: o => <span className="text-sm">{customers.find(c => c.id === o.userId)?.name ?? "—"}</span> },
  { key: "d", header: "Date", render: o => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
  { key: "s", header: "Status", render: o => <StatusBadge status={o.status} /> },
  { key: "t", header: "Total", render: o => <span className="font-semibold">{formatINR(o.total)}</span>, className: "text-right" },
];

export default function AdminPage() {
  return (
    <DashboardPage eyebrow="Today" title="Overview">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={formatINR(revenue)} delta={12.4} icon={IndianRupee} tint="primary" />
        <StatCard label="Orders" value={formatNumber(orders.length)} delta={8.1} icon={ShoppingCart} tint="accent" />
        <StatCard label="Customers" value={formatNumber(customers.length)} delta={4.7} icon={Users} tint="brass" />
        <StatCard label="Products" value={formatNumber(products.length)} delta={-2.1} icon={Package} tint="muted" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-serif font-bold text-lg mb-1">Sales this week</h3>
          <p className="text-xs text-muted-foreground mb-6">Daily revenue, last 7 days</p>
          <SalesChart />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-serif font-bold text-lg mb-4">Top products</h3>
          <TopProductsList products={products} />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-serif text-lg font-bold">Latest orders</h3>
        </div>
        <DataTable columns={cols} rows={orders.slice(0, 6)} />
      </div>
    </DashboardPage>
  );
}
