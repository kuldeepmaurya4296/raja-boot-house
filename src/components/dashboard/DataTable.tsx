import type { ReactNode } from "react";

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode; className?: string; }

export function DataTable<T extends { id: string }>({ columns, rows, empty = "No records" }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-muted/60">
            <tr>
              {columns.map(c => <th key={c.key} className={`text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3 ${c.className ?? ""}`}>{c.header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-muted-foreground">{empty}</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="hover:bg-muted/30 transition">
                {columns.map(c => <td key={c.key} className={`px-5 py-4 align-middle ${c.className ?? ""}`}>{c.render(r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    delivered: "bg-emerald-100 text-emerald-800",
    shipped: "bg-blue-100 text-blue-800",
    processing: "bg-amber-100 text-amber-900",
    pending: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
    active: "bg-emerald-100 text-emerald-800",
  };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? "bg-muted"}`}>{status}</span>;
}
