import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { StatCard } from "@/modules/admin/dashboard/components/StatCard";
import { IndianRupee, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/format";
import { connectToDatabase as dbConnect } from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await dbConnect();
  
  const [orders, totalUsers, categoriesRaw, products] = await Promise.all([
    Order.find({ status: { $in: ["DELIVERED", "SHIPPED", "PROCESSING", "PLACED"] } }).lean(),
    User.countDocuments({ role: "customer" }),
    Category.find({}).lean(),
    Product.find({}).lean()
  ]);

  const mrr = orders.reduce((sum: number, o: any) => sum + (o.pricing?.total || 0), 0);
  const aov = orders.length > 0 ? mrr / orders.length : 0;
  
  // Calculate category distribution based on products count for simplicity
  const totalProducts = products.length || 1; // avoid division by zero
  const categoryStats = categoriesRaw.map((c: any) => {
    const count = products.filter((p: any) => p.category?.toString() === c._id.toString()).length;
    return {
      id: c._id.toString(),
      name: c.name,
      pct: Math.round((count / totalProducts) * 100)
    };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <DashboardPage eyebrow="Insights" title="Analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatINR(mrr)} delta={14.2} icon={IndianRupee} />
        <StatCard label="AOV" value={formatINR(aov)} delta={6.1} icon={ShoppingCart} tint="accent" />
        <StatCard label="Conversion" value="3.42%" delta={0.8} icon={TrendingUp} tint="brass" />
        <StatCard label="Customers" value={totalUsers.toString()} delta={-3.2} icon={Users} tint="muted" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-card">
          <h3 className="font-serif font-bold text-lg mb-4">Inventory by category</h3>
          <div className="space-y-3">
            {categoryStats.map(c => (
              <div key={c.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-cognac" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
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
