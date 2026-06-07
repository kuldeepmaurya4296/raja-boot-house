"use client";

import { DashboardPage } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { IndianRupee, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/format";
import { categories } from "@/data/categories";

export default function AdminAnalyticsPage() {
  return (
    <DashboardPage eyebrow="Insights" title="Analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="MRR" value={formatINR(48230)} delta={14.2} icon={IndianRupee} />
        <StatCard label="AOV" value={formatINR(312)} delta={6.1} icon={ShoppingCart} tint="accent" />
        <StatCard label="Conversion" value="3.42%" delta={0.8} icon={TrendingUp} tint="brass" />
        <StatCard label="New users" value="184" delta={-3.2} icon={Users} tint="muted" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-serif font-bold text-lg mb-4">Revenue by category</h3>
          <div className="space-y-3">
            {categories.map(c => {
              const pct = Math.round((c.productCount / 24) * 100);
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-cognac" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-serif font-bold text-lg mb-4">Traffic sources</h3>
          <div className="space-y-3 text-sm">
            {[["Organic search", 42], ["Direct", 28], ["Instagram", 18], ["Referral", 8], ["Email", 4]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between items-center">
                <span>{k}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cognac" style={{ width: `${v}%` }} />
                  </div>
                  <span className="font-semibold w-8 text-right">{v}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
