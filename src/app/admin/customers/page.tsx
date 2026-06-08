"use client";

import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { DataTable, type Column } from "@/modules/admin/shared/components/DataTable";
import { customers, type User } from "@/data/users";
import { formatINR, formatDate } from "@/lib/format";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TableSearch, TablePagination } from "@/modules/admin/shared/components/DataTableControls";

const cols: Column<User>[] = [
  { key: "n", header: "Customer", sortKey: "name", render: u => (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
        {u.name.split(" ").map(p => p[0]).join("")}
      </div>
      <div>
        <p className="font-medium text-sm">{u.name}</p>
        <p className="text-xs text-muted-foreground">{u.email}</p>
      </div>
    </div>
  )},
  { key: "j", header: "Joined", sortKey: "joinedAt", render: u => <span className="text-sm text-muted-foreground">{formatDate(u.joinedAt)}</span> },
  { key: "o", header: "Orders", sortKey: "orders", render: u => <span className="text-sm font-semibold">{u.orders}</span> },
  { key: "s", header: "Spent", sortKey: "totalSpent", render: u => <span className="text-sm font-semibold">{formatINR(u.totalSpent)}</span>, className: "text-right" },
];

function CustomersContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sortKey = searchParams.get("sort") || "joinedAt";
  const sortOrder = searchParams.get("order") === "asc" ? 1 : -1;

  let filtered = [...customers];
  if (q) {
    filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
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
        <TableSearch placeholder="Search name or email..." />
      </div>
      <div>
        <DataTable columns={cols} rows={paginated} empty="No customers found." />
        <TablePagination totalItems={totalItems} itemsPerPage={limit} />
      </div>
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <DashboardPage eyebrow="People" title="Customers">
      <Suspense fallback={<div>Loading...</div>}>
        <CustomersContent />
      </Suspense>
    </DashboardPage>
  );
}
