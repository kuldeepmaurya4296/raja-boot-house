import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { orders as fallbackOrders } from "@/data/orders";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const db = await connectToDatabase();
    if (!db) {
      console.warn("Using local mock orders fallback (database offline).");
      let list = fallbackOrders;
      if (userId) {
        list = list.filter((o) => o.userId === userId);
      }
      return NextResponse.json(list);
    }

    let query: any = {};
    if (userId) {
      query.userId = userId;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, pricing, coupon, payment } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      console.warn("MongoDB offline. Simulating order placement success.");
      return NextResponse.json({
        success: true,
        orderId: `RBH-${Date.now()}`,
        message: "Order placed successfully (simulated fallback).",
      });
    }

    // Generate unique orderId
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `RBH-${dateStr}-${randomSuffix}`;

    // Create Order Document
    const order = await Order.create({
      orderId,
      userId: userId || null,
      items,
      shippingAddress,
      pricing,
      coupon: coupon || {},
      payment: {
        method: payment?.method || "COD",
        razorpayOrderId: payment?.razorpayOrderId || null,
        razorpayPaymentId: payment?.razorpayPaymentId || null,
        status: payment?.status || "PENDING",
      },
      status: "PLACED",
      statusHistory: [{ status: "PLACED", timestamp: new Date(), note: "Order placed." }],
    });

    // Decrement stock for purchased sizes
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const variantIndex = product.variants.findIndex(
          (v: any) => v.size === item.size && v.color === item.color
        );
        if (variantIndex >= 0) {
          product.variants[variantIndex].stock = Math.max(
            0,
            product.variants[variantIndex].stock - item.qty
          );
          await product.save();
        }
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: error.message || "Order placement failed" }, { status: 500 });
  }
}
