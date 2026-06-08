"use client";

import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { DataTable, StatusBadge, type Column } from "@/modules/admin/shared/components/DataTable";
import { vendors, type Vendor } from "@/data/vendors";
import { formatINR, formatDate } from "@/lib/format";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TableSearch, TablePagination, TableFilter } from "@/modules/admin/shared/components/DataTableControls";

const cols: Column<Vendor>[] = [
  { key: "n", header: "Vendor", sortKey: "name", render: v => <div><p className="font-medium text-sm">{v.name}</p><p className="text-xs text-muted-foreground">{v.tagline}</p></div> },
  { key: "j", header: "Joined", sortKey: "joinedAt", render: v => <span className="text-sm text-muted-foreground">{formatDate(v.joinedAt)}</span> },
  { key: "p", header: "Products", sortKey: "productsCount", render: v => <span className="text-sm">{v.productsCount}</span> },
  { key: "r", header: "Revenue", sortKey: "revenue", render: v => <span className="text-sm font-semibold">{formatINR(v.revenue)}</span> },
  { key: "rt", header: "Rating", sortKey: "rating", render: v => <span className="text-sm">{v.rating}★</span> },
  { key: "s", header: "Status", sortKey: "status", render: v => <StatusBadge status={v.status} /> },
];

function VendorsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortKey = searchParams.get("sort") || "joinedAt";
  const sortOrder = searchParams.get("order") === "asc" ? 1 : -1;
  const statusFilter = searchParams.get("status") || "";

  let filtered = [...vendors];
  if (statusFilter) {
    filtered = filtered.filter(v => v.status === statusFilter);
  }
  if (q) {
    filtered = filtered.filter(v => v.name.toLowerCase().includes(q) || v.tagline.toLowerCase().includes(q));
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
        <TableSearch placeholder="Search vendor name..." />
        <TableFilter 
          filterKey="status" 
          options={[
            { label: "Active", value: "active" },
            { label: "Pending", value: "pending" }
          ]} 
        />
      </div>
      <div>
        <DataTable columns={cols} rows={paginated} empty="No vendors found." />
        <TablePagination totalItems={totalItems} itemsPerPage={limit} />
      </div>
    </div>
  );
}

export default function AdminVendorsPage() {
  return (
    <DashboardPage eyebrow="Marketplace" title="Vendors">
      <Suspense fallback={<div>Loading...</div>}>
        <VendorsContent />
      </Suspense>
    </DashboardPage>
  );
}
