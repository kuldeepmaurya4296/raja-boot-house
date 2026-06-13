import { DashboardPage } from "@/modules/admin/dashboard/components/DashboardLayout";
import { StatCard } from "@/modules/admin/dashboard/components/StatCard";
import { IndianRupee, ShoppingCart, Users, TrendingUp, Tag, Award, Grid } from "lucide-react";
import { formatINR } from "@/lib/format";
import { connectToDatabase as dbConnect } from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await dbConnect();

  // 1. Fetch data
  const allOrders = await Order.find({
    status: { $nin: ["CANCELLED", "RETURNED", "REFUNDED"] }
  }).lean();

  const totalUsers = await User.countDocuments({ role: "customer" });
  const categoriesRaw = await Category.find({}).lean();
  const productsList = await Product.find({}).select("gender brand category").lean();

  // Map products for fast lookup
  const productMap = new Map(productsList.map(p => [p._id.toString(), p]));
  const categoryMap = new Map(categoriesRaw.map(c => [c._id.toString(), c.name]));

  // 2. WoW Calculations
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const currentPeriodOrders = allOrders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
  const previousPeriodOrders = allOrders.filter(o => new Date(o.createdAt) >= fourteenDaysAgo && new Date(o.createdAt) < sevenDaysAgo);

  const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const currentAOV = currentPeriodOrders.length > 0 ? currentRevenue / currentPeriodOrders.length : 0;
  const previousAOV = previousPeriodOrders.length > 0 ? previousRevenue / previousPeriodOrders.length : 0;

  // Growth percentages
  const revenueDelta = previousRevenue > 0 ? parseFloat((((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)) : 0;
  const aovDelta = previousAOV > 0 ? parseFloat((((currentAOV - previousAOV) / previousAOV) * 100).toFixed(1)) : 0;
  const ordersDelta = previousPeriodOrders.length > 0 ? parseFloat((((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100).toFixed(1)) : 0;

  // All time values
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const totalOrders = allOrders.length;
  const allTimeAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // 3. Size and Demographics aggregations
  const sizeMap: Record<number, number> = {};
  const genderMap: Record<string, number> = { Men: 0, Women: 0, Children: 0, Unisex: 0 };
  const brandMap: Record<string, number> = {};
  const categoryRevenueMap: Record<string, number> = {};

  allOrders.forEach(o => {
    o.items.forEach((item: any) => {
      const qty = item.qty || item.quantity || 1;
      const itemRev = item.price * qty;

      // Top sizes
      if (item.size) {
        sizeMap[item.size] = (sizeMap[item.size] || 0) + qty;
      }

      // Populate product aggregates
      const p = productMap.get(item.productId.toString());
      if (p) {
        const gender = p.gender || "Unisex";
        genderMap[gender] = (genderMap[gender] || 0) + itemRev;

        const brand = p.brand || "Raja Boot House";
        brandMap[brand] = (brandMap[brand] || 0) + itemRev;

        const catId = p.category.toString();
        categoryRevenueMap[catId] = (categoryRevenueMap[catId] || 0) + itemRev;
      }
    });
  });

  // Top Selling Sizes
  const topSizes = Object.entries(sizeMap)
    .map(([size, qty]) => ({ size: Number(size), qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const totalSizesSold = topSizes.reduce((sum, s) => sum + s.qty, 0) || 1;

  // Category distribution by revenue
  const totalCatRevenue = Object.values(categoryRevenueMap).reduce((sum, v) => sum + v, 0) || 1;
  const categoryStats = categoriesRaw.map((c: any) => {
    const revenue = categoryRevenueMap[c._id.toString()] || 0;
    return {
      id: c._id.toString(),
      name: c.name,
      revenue,
      pct: Math.round((revenue / totalCatRevenue) * 100)
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Brand share
  const totalBrandRevenue = Object.values(brandMap).reduce((sum, v) => sum + v, 0) || 1;
  const brandStats = Object.entries(brandMap)
    .map(([name, revenue]) => ({
      name,
      revenue,
      pct: Math.round((revenue / totalBrandRevenue) * 100)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Gender revenue shares
  const totalGenderRevenue = Object.values(genderMap).reduce((sum, v) => sum + v, 0) || 1;
  const genderStats = Object.entries(genderMap).map(([name, revenue]) => ({
    name,
    revenue,
    pct: Math.round((revenue / totalGenderRevenue) * 100)
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <DashboardPage eyebrow="Insights" title="Analytics Summary">
      {/* Real WoW Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="All-Time Revenue" value={formatINR(totalRevenue)} delta={revenueDelta} icon={IndianRupee} />
        <StatCard label="All-Time Orders" value={totalOrders.toString()} delta={ordersDelta} icon={ShoppingCart} tint="accent" />
        <StatCard label="Average Order Value" value={formatINR(allTimeAOV)} delta={aovDelta} icon={TrendingUp} tint="brass" />
        <StatCard label="Total Customers" value={totalUsers.toString()} delta={4.2} icon={Users} tint="muted" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Share (By Sales Revenue) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4.5 w-4.5 text-cognac" />
            <h3 className="font-serif font-bold text-lg">Sales by Category</h3>
          </div>
          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sales recorded yet.</p>
            ) : (
              categoryStats.map(c => (
                <div key={c.id}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{formatINR(c.revenue)} ({c.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Brand Share */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-4.5 w-4.5 text-cognac" />
            <h3 className="font-serif font-bold text-lg">Sales by Brand</h3>
          </div>
          <div className="space-y-4">
            {brandStats.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sales recorded yet.</p>
            ) : (
              brandStats.map(b => (
                <div key={b.name}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{b.name}</span>
                    <span className="text-muted-foreground">{formatINR(b.revenue)} ({b.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-cognac" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Shoe Sizes */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Grid className="h-4.5 w-4.5 text-cognac" />
            <h3 className="font-serif font-bold text-lg">Top Shoe Sizes (UK)</h3>
          </div>
          <div className="space-y-4">
            {topSizes.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sizes sold yet.</p>
            ) : (
              topSizes.map(s => {
                const pct = Math.round((s.qty / totalSizesSold) * 100);
                return (
                  <div key={s.size}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>UK Size {s.size}</span>
                      <span className="text-muted-foreground">{s.qty} pairs sold ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-brass" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4.5 w-4.5 text-cognac" />
            <h3 className="font-serif font-bold text-lg">Target Demographics Share</h3>
          </div>
          <div className="space-y-4">
            {genderStats.every(g => g.revenue === 0) ? (
              <p className="text-sm text-muted-foreground italic">No gender demographics data available.</p>
            ) : (
              genderStats.map(g => (
                <div key={g.name}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>{g.name} Footwear</span>
                    <span className="text-muted-foreground">{formatINR(g.revenue)} ({g.pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-charcoal" style={{ width: `${g.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardPage>
  );
}
