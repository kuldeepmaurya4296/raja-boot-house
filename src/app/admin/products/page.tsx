"use client";

import { DashboardPage } from "@/components/dashboard/DashboardLayout";
import { DataTable, type Column } from "@/components/dashboard/DataTable";
import { products, type Product } from "@/data/products";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/format";

const cols: Column<Product>[] = [
  { key: "p", header: "Product", render: p => (
    <div className="flex items-center gap-3 min-w-0">
      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{p.name}</p>
        <p className="text-xs text-muted-foreground">{p.slug}</p>
      </div>
    </div>
  )},
  { key: "c", header: "Category", render: p => <span className="text-sm capitalize">{p.category}</span> },
  { key: "pr", header: "Price", render: p => <span className="text-sm font-semibold">{formatINR(p.price)}</span> },
  { key: "s", header: "Stock", render: p => <span className={`text-sm font-semibold ${p.stock < 10 ? "text-destructive" : ""}`}>{p.stock}</span> },
  { key: "r", header: "Rating", render: p => <span className="text-sm">{p.rating}★ ({p.reviewsCount})</span> },
  { key: "a", header: "", render: () => (
    <div className="flex gap-1 justify-end">
      <button className="p-1.5 hover:bg-muted rounded cursor-pointer">
        <Edit className="h-3.5 w-3.5" />
      </button>
      <button className="p-1.5 hover:bg-destructive/10 text-destructive rounded cursor-pointer">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  ), className: "text-right" },
];

export default function AdminProductsPage() {
  return (
    <DashboardPage eyebrow="Catalog" title="Products" action={
      <button className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
        <Plus className="h-4 w-4" /> Add product
      </button>
    }>
      <DataTable columns={cols} rows={products} />
    </DashboardPage>
  );
}
