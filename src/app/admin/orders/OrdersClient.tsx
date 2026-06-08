"use client";

import { DataTable, StatusBadge, type Column } from "@/modules/admin/shared/components/DataTable";
import { TableSearch, TablePagination, TableFilter } from "@/modules/admin/shared/components/DataTableControls";
import { formatINR, formatDate } from "@/lib/format";
import { Suspense } from "react";

const cols: Column<any>[] = [
  { key: "n", header: "Order", sortKey: "orderId", render: o => <span className="font-semibold text-sm">{o.orderId}</span> },
  { key: "c", header: "Customer", render: o => <span className="text-sm">{o.customerName}</span> },
  { key: "i", header: "Items", render: o => <span className="text-sm">{o.itemCount}</span> },
  { key: "p", header: "Payment", sortKey: "payment", render: o => <span className="text-sm uppercase text-xs">{o.paymentMethod}</span> },
  { key: "d", header: "Date", sortKey: "createdAt", render: o => <span className="text-sm text-muted-foreground">{formatDate(o.createdAt)}</span> },
  { key: "s", header: "Status", sortKey: "status", render: o => <StatusBadge status={o.status} /> },
  { key: "t", header: "Total", sortKey: "total", render: o => <span className="font-semibold">{formatINR(o.total)}</span>, className: "text-right" },
];

export function OrdersClient({ orders, totalItems }: { orders: any[]; totalItems: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Suspense fallback={null}>
          <TableSearch placeholder="Search order number..." />
        </Suspense>
        <Suspense fallback={null}>
          <TableFilter 
            filterKey="status" 
            options={[
              { label: "Placed", value: "PLACED" },
              { label: "Processing", value: "PROCESSING" },
              { label: "Shipped", value: "SHIPPED" },
              { label: "Delivered", value: "DELIVERED" },
              { label: "Cancelled", value: "CANCELLED" }
            ]} 
          />
        </Suspense>
      </div>
      <div>
        <DataTable columns={cols} rows={orders} empty="No orders found." />
        <Suspense fallback={null}>
          <TablePagination totalItems={totalItems} itemsPerPage={10} />
        </Suspense>
      </div>
    </div>
  );
}
