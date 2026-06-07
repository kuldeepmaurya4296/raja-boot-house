"use client";

import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { DataTable, StatusBadge, type Column } from "@/modules/admin/shared/components/DataTable";
import { orders, type Order } from "@/data/orders";
import { customers } from "@/data/users";
import { formatINR, formatDate } from "@/lib/format";
import { useState } from "react";

const cols: Column<Order>[] = [
  { key: "n", header: "Order", render: o => <span className="font-semibold text-sm">{o.number}</span> },
  { key: "c", header: "Customer", render: o => <span className="text-sm">{customers.find(c => c.id === o.userId)?.name ?? "—"}</span> },
  { key: "i", header: "Items", render: o => <span className="text-sm">{o.items.length}</span> },
  { key: "p", header: "Payment", render: o => <span className="text-sm uppercase text-xs">{o.payment}</span> },
  { key: "d", header: "Date", render: o => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
  { key: "s", header: "Status", render: o => <StatusBadge status={o.status} /> },
  { key: "t", header: "Total", render: o => <span className="font-semibold">{formatINR(o.total)}</span>, className: "text-right" },
];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("all");
  const filtered = status === "all" ? orders : orders.filter(o => o.status === status);
  return (
    <DashboardPage eyebrow="Fulfilment" title="Orders">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize cursor-pointer whitespace-nowrap ${status === s ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>{s}</button>
        ))}
      </div>
      <DataTable columns={cols} rows={filtered} />
    </DashboardPage>
  );
}
