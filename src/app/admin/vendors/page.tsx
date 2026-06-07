"use client";

import { DashboardPage } from "@/components/dashboard/DashboardLayout";
import { DataTable, StatusBadge, type Column } from "@/components/dashboard/DataTable";
import { vendors, type Vendor } from "@/data/vendors";
import { formatINR, formatDate } from "@/lib/format";

const cols: Column<Vendor>[] = [
  { key: "n", header: "Vendor", render: v => <div><p className="font-medium text-sm">{v.name}</p><p className="text-xs text-muted-foreground">{v.tagline}</p></div> },
  { key: "j", header: "Joined", render: v => <span className="text-sm text-muted-foreground">{formatDate(v.joinedAt)}</span> },
  { key: "p", header: "Products", render: v => <span className="text-sm">{v.productsCount}</span> },
  { key: "r", header: "Revenue", render: v => <span className="text-sm font-semibold">{formatINR(v.revenue)}</span> },
  { key: "rt", header: "Rating", render: v => <span className="text-sm">{v.rating}★</span> },
  { key: "s", header: "Status", render: v => <StatusBadge status={v.status} /> },
];

export default function AdminVendorsPage() {
  return (
    <DashboardPage eyebrow="Marketplace" title="Vendors">
      <DataTable columns={cols} rows={vendors} />
    </DashboardPage>
  );
}
