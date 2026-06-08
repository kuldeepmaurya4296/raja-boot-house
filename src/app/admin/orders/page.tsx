"use client";

import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { DataTable, StatusBadge, type Column } from "@/modules/admin/shared/components/DataTable";
import { orders, type Order } from "@/data/orders";
import { customers } from "@/data/users";
import { formatINR, formatDate } from "@/lib/format";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TableSearch, TablePagination, TableFilter } from "@/modules/admin/shared/components/DataTableControls";

const cols: Column<Order>[] = [
  { key: "n", header: "Order", sortKey: "number", render: o => <span className="font-semibold text-sm">{o.number}</span> },
  { key: "c", header: "Customer", render: o => <span className="text-sm">{customers.find(c => c.id === o.userId)?.name ?? "—"}</span> },
  { key: "i", header: "Items", render: o => <span className="text-sm">{o.items.length}</span> },
  { key: "p", header: "Payment", sortKey: "payment", render: o => <span className="text-sm uppercase text-xs">{o.payment}</span> },
  { key: "d", header: "Date", sortKey: "createdAt", render: o => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
  { key: "s", header: "Status", sortKey: "status", render: o => <StatusBadge status={o.status} /> },
  { key: "t", header: "Total", sortKey: "total", render: o => <span className="font-semibold">{formatINR(o.total)}</span>, className: "text-right" },
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortKey = searchParams.get("sort") || "createdAt";
  const sortOrder = searchParams.get("order") === "asc" ? 1 : -1;
  const statusFilter = searchParams.get("status") || "";

  let filtered = orders;
  if (statusFilter) {
    filtered = filtered.filter(o => o.status === statusFilter);
  }
  if (q) {
    filtered = filtered.filter(o => o.number.toLowerCase().includes(q));
  }

  filtered.sort((a, b) => {
    let valA = (a as any)[sortKey];
    let valB = (b as any)[sortKey];
    if (valA < valB) return -1 * sortOrder;
    if (valA > valB) return 1 * sortOrder;
    return 0;
  });

  const limit = 10;
  const totalItems = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <TableSearch placeholder="Search order number..." />
        <TableFilter 
          filterKey="status" 
          options={[
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" }
          ]} 
        />
      </div>
      <div>
        <DataTable columns={cols} rows={paginated} empty="No orders found." />
        <TablePagination totalItems={totalItems} itemsPerPage={limit} />
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <DashboardPage eyebrow="Fulfilment" title="Orders">
      <Suspense fallback={<div>Loading...</div>}>
        <OrdersContent />
      </Suspense>
    </DashboardPage>
  );
}
