import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import { orders as fallbackOrders } from "@/data/orders";
import { customers as fallbackCustomers } from "@/data/users";
import { products as fallbackProducts } from "@/data/products";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      console.warn("Using local mock files for admin dashboard fallback (database offline).");
      
      const totalRevenue = fallbackOrders.reduce((sum, o) => sum + o.total, 0);
      const ordersCount = fallbackOrders.length;
      const customersCount = fallbackCustomers.length;
      const productsCount = fallbackProducts.length;

      // Mock sales chart (last 7 days)
      const salesChart = {
        data: [42000, 58000, 51000, 73000, 65000, 88000, 79000],
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      };

      const latestOrders = fallbackOrders.slice(0, 6);
      const topProducts = fallbackProducts.slice(0, 5);
      const lowStockAlerts = fallbackProducts
        .filter((p: any) => p.stock < 10)
        .map((p: any) => ({ id: p.id, name: p.name, stock: p.stock }));

      return NextResponse.json({
        revenue: totalRevenue,
        ordersCount,
        customersCount,
        productsCount,
        salesChart,
        latestOrders,
        topProducts,
        lowStockAlerts,
      });
    }

    // Live DB aggregation
    const ordersCount = await Order.countDocuments();
    const customersCount = await User.countDocuments({ role: "customer" });
    const productsCount = await Product.countDocuments();

    // Sum revenue from PAID orders
    const paidOrders = await Order.find({ "payment.status": "PAID" });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.pricing.total, 0);

    // Dynamic sales chart for last 7 days
    const today = new Date();
    const last7DaysData: number[] = [];
    const last7DaysLabels: string[] = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dailyOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        "payment.status": "PAID",
      });

      const dayRevenue = dailyOrders.reduce((sum, o) => sum + o.pricing.total, 0);
      last7DaysData.push(dayRevenue);
      last7DaysLabels.push(weekdays[d.getDay()]);
    }

    // Fetch latest 6 orders and populate customer user info
    const rawLatestOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6);

    const latestOrders = [];
    for (const o of rawLatestOrders) {
      let customerName = "—";
      if (o.userId) {
        const userDoc = await User.findById(o.userId);
        if (userDoc) customerName = userDoc.name;
      } else {
        customerName = o.shippingAddress?.fullName || "—";
      }

      latestOrders.push({
        id: o._id.toString(),
        orderId: o.orderId,
        number: o.orderId,
        customerName,
        createdAt: o.createdAt,
        status: o.status,
        total: o.pricing.total,
        paymentStatus: o.payment.status,
      });
    }

    // Fetch top products (e.g. sorted by rating count or featured)
    const rawProducts = await Product.find({ isActive: true })
      .sort({ "rating.count": -1 })
      .limit(5);

    const topProducts = rawProducts.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: p.images && p.images[0] ? p.images[0].url : "/assets/product-placeholder.jpg",
      price: p.salePrice,
      reviewsCount: p.rating ? p.rating.count : 0,
    }));

    // Find products with low stock (variant stock < 5)
    const rawLowStockProducts = await Product.find({
      isActive: true,
      "variants.stock": { $lt: 5 },
    }).limit(10);

    const lowStockAlerts = rawLowStockProducts.map((p) => {
      const minStock = p.variants.reduce((min: number, v: any) => (v.stock < min ? v.stock : min), 9999);
      return {
        id: p._id.toString(),
        name: p.name,
        stock: minStock === 9999 ? 0 : minStock,
      };
    });

    return NextResponse.json({
      revenue: totalRevenue,
      ordersCount,
      customersCount,
      productsCount,
      salesChart: {
        data: last7DaysData,
        labels: last7DaysLabels,
      },
      latestOrders,
      topProducts,
      lowStockAlerts,
    });
  } catch (error: any) {
    console.error("Dashboard metrics aggregation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
