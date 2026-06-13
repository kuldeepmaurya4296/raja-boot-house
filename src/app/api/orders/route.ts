import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Counter from "@/lib/models/Counter";
import { auth } from "@/lib/auth";
import User from "@/lib/models/User";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "@/lib/email";

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

    // Generate unique sequential orderId prefix as RBH and 5 digit suffix using atomic Mongo counter
    const counter = await Counter.findOneAndUpdate(
      { _id: "orderId" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    const orderId = `RBH-${String(counter.seq).padStart(5, "0")}`;

    // Validate prices and check stock first (without updating)
    const enrichedItems = [];
    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
      }
      // Re-validate price
      if (prod.salePrice !== item.price) {
        return NextResponse.json({
          error: `Price mismatch for ${prod.name}. Expected ₹${prod.salePrice}, but cart had ₹${item.price}. Please refresh your cart.`,
        }, { status: 400 });
      }
      // Check stock
      const variant = prod.variants.find(
        (v: any) => v.size === item.size && v.color === item.color
      );
      if (!variant) {
        return NextResponse.json({
          error: `Variant not found for product ${prod.name} (Size: ${item.size}, Color: ${item.color})`,
        }, { status: 400 });
      }
      if (variant.stock < item.qty) {
        return NextResponse.json({
          error: `Insufficient stock for product ${prod.name} (Size: ${item.size}, Color: ${item.color}). Available: ${variant.stock}, requested: ${item.qty}`,
        }, { status: 400 });
      }
      enrichedItems.push({
        productId: item.productId,
        name: prod.name,
        image: item.image,
        size: item.size,
        color: item.color,
        price: prod.salePrice,
        qty: item.qty,
        returnDays: prod.returnDays ?? 7,
      });
    }

    // Now decrement stock atomically
    const decrementedItems = [];
    try {
      for (const item of items) {
        const updateResult = await Product.updateOne(
          {
            _id: item.productId,
            variants: {
              $elemMatch: { size: item.size, color: item.color, stock: { $gte: item.qty } }
            }
          },
          {
            $inc: { "variants.$.stock": -item.qty }
          }
        );
        if (updateResult.modifiedCount === 0) {
          throw new Error(`Insufficient stock for variant (Size: ${item.size}, Color: ${item.color}) of ${item.name}.`);
        }
        decrementedItems.push(item);
      }
    } catch (err: any) {
      // Rollback stock decrement for completed items
      for (const rolledBack of decrementedItems) {
        await Product.updateOne(
          {
            _id: rolledBack.productId,
            "variants.size": rolledBack.size,
            "variants.color": rolledBack.color,
          },
          {
            $inc: { "variants.$.stock": rolledBack.qty }
          }
        );
      }
      return NextResponse.json({ error: err.message || "Failed to reserve stock due to high demand. Please try again." }, { status: 400 });
    }

    let order;
    try {
      // Create Order Document
      order = await Order.create({
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
    } catch (orderErr: any) {
      // Order creation failed, rollback ALL stock decrements
      for (const rolledBack of items) {
        await Product.updateOne(
          {
            _id: rolledBack.productId,
            "variants.size": rolledBack.size,
            "variants.color": rolledBack.color,
          },
          {
            $inc: { "variants.$.stock": rolledBack.qty }
          }
        );
      }
      throw orderErr;
    }

    // Send order confirmation email asynchronously
    if (session?.user?.email) {
      sendOrderConfirmationEmail(session.user.email, order).catch((err) =>
        console.error("Order confirmation email error:", err)
      );
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
    return nextStatus === "REFUNDED";
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

    if (status === "CANCELLED" && currentStatus !== "CANCELLED") {
      // Loop through order items and increment variant stock back
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const variantIndex = product.variants.findIndex(
            (v: any) => v.size === item.size && v.color === item.color
          );
          if (variantIndex >= 0) {
            product.variants[variantIndex].stock = product.variants[variantIndex].stock + item.qty;
            await product.save();
          }
        }
      }
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}.`,
    });

    await order.save();

    // Send order status update email asynchronously
    try {
      const customer = await User.findById(order.userId).select("email").lean();
      if (customer?.email) {
        sendOrderStatusEmail(customer.email, order, status, note).catch((err) =>
          console.error("Order status update email error:", err)
        );
      }
    } catch (emailErr) {
      console.error("Failed to fetch customer email for status update notification:", emailErr);
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}


