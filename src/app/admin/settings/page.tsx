"use client";

import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";

export default function AdminSettingsPage() {
  return (
    <DashboardPage eyebrow="Configuration" title="Settings">
      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl space-y-5">
        {[["Store name", "Raja Boot House"], ["Support email", "care@rajaboothouse.com"], ["Currency", "INR — ₹"], ["Tax rate", "8%"]].map(([l, v]) => (
          <label key={l} className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{l}</span>
            <input defaultValue={v} className="mt-1.5 w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm" />
          </label>
        ))}
        <button className="bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-semibold cursor-pointer">
          Save
        </button>
      </div>
    </DashboardPage>
  );
}
