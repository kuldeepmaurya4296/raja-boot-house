"use client";

import { DashboardPage } from "@/components/dashboard/DashboardLayout";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { customers, type User } from "@/data/users";
import { formatINR, formatDate } from "@/lib/format";

const cols: Column<User>[] = [
  { key: "n", header: "Customer", render: u => (
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
  { key: "j", header: "Joined", render: u => <span className="text-sm text-muted-foreground">{formatDate(u.joinedAt)}</span> },
  { key: "o", header: "Orders", render: u => <span className="text-sm font-semibold">{u.orders}</span> },
  { key: "s", header: "Spent", render: u => <span className="text-sm font-semibold">{formatINR(u.totalSpent)}</span>, className: "text-right" },
];

export default function AdminCustomersPage() {
  return (
    <DashboardPage eyebrow="People" title="Customers">
      <DataTable columns={cols} rows={customers} />
    </DashboardPage>
  );
}
