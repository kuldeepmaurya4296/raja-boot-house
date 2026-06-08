import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    let query: any = {};
    if (session.user.role !== "admin" && session.user.role !== "vendor") {
      query.userId = session.user.id;
    } else if (userId) {
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, pricing, coupon, payment } = body;

    if (!items || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    const userId = session.user.id;

    // Generate unique sequential orderId prefix as RBH and 5 digit suffix (e.g. RBH-00001)
    const lastOrder = await Order.findOne({ orderId: /^RBH-\d{5}$/ })
      .sort({ orderId: -1 })
      .lean();
    
    let nextNum = 1;
    if (lastOrder) {
      const lastNum = parseInt(lastOrder.orderId.replace("RBH-", ""), 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const orderId = `RBH-${String(nextNum).padStart(5, "0")}`;

    // Enrich items with current returnDays from Product catalog
    const enrichedItems = [];
    for (const item of items) {
      const prod = await Product.findById(item.productId).lean();
      enrichedItems.push({
        productId: item.productId,
        name: item.name,
        image: item.image,
        size: item.size,
        color: item.color,
        price: item.price,
        qty: item.qty,
        returnDays: prod ? (prod.returnDays ?? 7) : 7
      });
    }

    // Create Order Document
    const order = await Order.create({
      orderId,
      userId,
      items: enrichedItems,
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

const standardOrder = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

function isTransitionAllowed(currentStatus: string, nextStatus: string): boolean {
  if (currentStatus === nextStatus) return false;
  if (currentStatus === "REFUNDED") return false;
  
  if (currentStatus === "CANCELLED") {
    return false;
  }
  
  // RETURN_REQUESTED can be approved (→ RETURNED) or rejected (→ DELIVERED)
  if (currentStatus === "RETURN_REQUESTED") {
    return nextStatus === "RETURNED" || nextStatus === "DELIVERED";
  }
  
  if (currentStatus === "RETURNED") {
    return nextStatus === "REFUNDED";
  }
  
  const curIdx = standardOrder.indexOf(currentStatus);
  if (curIdx === -1) return false;
  
  if (nextStatus === "CANCELLED") {
    return currentStatus !== "DELIVERED";
  }
  
  // Customer-initiated return request from DELIVERED
  if (nextStatus === "RETURN_REQUESTED") {
    return currentStatus === "DELIVERED";
  }
  
  // Only admin can directly mark as RETURNED (from RETURN_REQUESTED)
  if (nextStatus === "RETURNED") {
    return false;
  }
  
  if (nextStatus === "REFUNDED") {
    return false;
  }
  
  const nextIdx = standardOrder.indexOf(nextStatus);
  if (nextIdx === -1) return false;
  
  return nextIdx > curIdx;
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status, note } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Role-based authorization
    const isAdminOrVendor = session.user.role === "admin" || session.user.role === "vendor";
    const isOwner = order.userId.toString() === session.user.id;

    if (!isAdminOrVendor) {
      if (!isOwner || status !== "RETURN_REQUESTED") {
        return NextResponse.json({ error: "Unauthorized status transition" }, { status: 403 });
      }

      // Check return policy window
      const currentStatus = order.status || "PLACED";
      if (currentStatus !== "DELIVERED") {
        return NextResponse.json({ error: "Only delivered orders can be returned." }, { status: 400 });
      }

      const deliveredStep = order.statusHistory?.find((h: any) => h.status === "DELIVERED");
      const deliveredAt = deliveredStep ? new Date(deliveredStep.timestamp) : null;
      if (!deliveredAt) {
        return NextResponse.json({ error: "Delivery date timestamp not found." }, { status: 400 });
      }

      // Calculate days elapsed since delivery
      const diffTime = Math.abs(Date.now() - deliveredAt.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Calculate maximum return window among all items in order
      const maxReturnDays = order.items.reduce((max: number, item: any) => {
        const itemDays = typeof item.returnDays === "number" ? item.returnDays : 7;
        return itemDays > max ? itemDays : max;
      }, 0);

      if (diffDays > maxReturnDays) {
        return NextResponse.json({ 
          error: `The return period of ${maxReturnDays} days has expired. (Delivered ${diffDays} days ago)` 
        }, { status: 400 });
      }
    }

    const currentStatus = order.status || "PLACED";

    if (!isTransitionAllowed(currentStatus, status)) {
      return NextResponse.json({
        error: `Invalid status transition from ${currentStatus} to ${status}. Reverting or invalid bypassing is blocked.`
      }, { status: 400 });
    }

    if (status === "REFUNDED") {
      const { refundMethod, refundTransactionId } = body;
      if (!refundMethod || (refundMethod !== "ONLINE" && refundMethod !== "CASH")) {
        return NextResponse.json({ error: "A valid refund method (ONLINE or CASH) is required." }, { status: 400 });
      }
      if (refundMethod === "ONLINE" && (!refundTransactionId || typeof refundTransactionId !== "string" || !refundTransactionId.trim())) {
        return NextResponse.json({ error: "Transaction ID is compulsory for online refunds." }, { status: 400 });
      }

      order.refundDetails = {
        method: refundMethod,
        transactionId: refundMethod === "ONLINE" ? refundTransactionId.trim() : undefined,
        refundedAt: new Date(),
      };
      
      order.payment.status = "REFUNDED";
    }

    if (status === "DELIVERED" && order.payment.method === "COD") {
      const { codPaymentReceived } = body;
      if (!codPaymentReceived) {
        return NextResponse.json({ error: "Confirmation of payment collection is required for delivering COD orders." }, { status: 400 });
      }
      order.payment.status = "PAID";
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}.`,
    });

    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}


