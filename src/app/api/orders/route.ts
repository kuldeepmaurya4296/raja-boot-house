import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Counter from "@/lib/models/Counter";
import { auth } from "@/lib/auth";
import User from "@/lib/models/User";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from "@/lib/email";
import Settings from "@/lib/models/Settings";
import Coupon from "@/lib/models/Coupon";

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

const defaultGeneral = {
  storeName: "Raja Boot House",
  supportEmail: "care@rajaboothouse.com",
  taxRate: 8,
  currency: "INR — ₹",
  currencySymbol: "₹",
  defaultReturnDays: 7,
};

const defaultShipping = [
  { id: "std", name: "Standard", desc: "5–7 days", price: 0 },
  { id: "exp", name: "Express", desc: "2–3 days", price: 150 },
  { id: "same", name: "Same-day (Jawa Rewa)", desc: "Today", price: 350 }
];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, shippingAddress, pricing, coupon, payment } = body;

    if (!items || items.length === 0 || !shippingAddress || !pricing) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    const userId = session.user.id;

    // Load Settings
    const [generalDoc, shippingDoc] = await Promise.all([
      Settings.findOne({ key: "general" }).lean(),
      Settings.findOne({ key: "shipping_methods" }).lean()
    ]);

    const general = generalDoc ? { ...defaultGeneral, ...generalDoc.value } : defaultGeneral;
    const shippingMethods = shippingDoc ? shippingDoc.value : defaultShipping;

    // Validate prices and check stock first (without updating)
    const enrichedItems = [];
    let computedSubtotal = 0;
    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (!prod) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
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
      
      computedSubtotal += prod.salePrice * item.qty;

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

    // Validate subtotal
    if (pricing.subtotal !== computedSubtotal) {
      return NextResponse.json({
        error: `Subtotal verification failed. Calculated: ₹${computedSubtotal}, received: ₹${pricing.subtotal}`
      }, { status: 400 });
    }

    // Server-side Coupon validation
    let computedCouponDiscount = 0;
    if (coupon?.code) {
      const dbCoupon = await Coupon.findOne({ code: coupon.code.toUpperCase(), isActive: true });
      if (!dbCoupon) {
        return NextResponse.json({ error: "Invalid or inactive coupon code." }, { status: 400 });
      }

      // Check dates
      const now = new Date();
      if (now < new Date(dbCoupon.validFrom) || now > new Date(dbCoupon.validTill)) {
        return NextResponse.json({ error: "Coupon code has expired or is not yet valid." }, { status: 400 });
      }

      // Check minimum cart value
      if (computedSubtotal < dbCoupon.minCartValue) {
        return NextResponse.json({ error: `Coupon requires a minimum cart value of ₹${dbCoupon.minCartValue}.` }, { status: 400 });
      }

      // Calculate discount
      if (dbCoupon.type === "Percentage") {
        computedCouponDiscount = Math.round(computedSubtotal * (dbCoupon.value / 100));
      } else if (dbCoupon.type === "Flat") {
        computedCouponDiscount = dbCoupon.value;
      } else if (dbCoupon.type === "Free Shipping") {
        computedCouponDiscount = 0; // Waived shipping instead of cart discount
      }
    }

    // Validate couponDiscount from payload matches computed value
    if (pricing.couponDiscount !== computedCouponDiscount) {
      return NextResponse.json({
        error: `Coupon discount validation failed. Calculated: ₹${computedCouponDiscount}, received: ₹${pricing.couponDiscount}`
      }, { status: 400 });
    }

    // Validate shipping cost
    let computedShippingCost = 0;
    const clientShippingCost = pricing.shipping;
    const isFreeShippingCoupon = coupon?.code && (await Coupon.findOne({ code: coupon.code.toUpperCase() }))?.type === "Free Shipping";
    
    if (isFreeShippingCoupon) {
      computedShippingCost = 0;
    } else {
      // Find method matching client shipping cost
      const matchedMethod = shippingMethods.find((m: any) => m.price === clientShippingCost);
      if (!matchedMethod && clientShippingCost !== 0) {
        return NextResponse.json({ error: "Invalid shipping method/cost selected." }, { status: 400 });
      }
      computedShippingCost = clientShippingCost;
    }

    // Calculate Tax and Total
    const taxableAmount = Math.max(0, computedSubtotal - computedCouponDiscount);
    const computedTax = Math.round(taxableAmount * (general.taxRate / 100));
    const computedTotal = Math.max(0, taxableAmount + computedShippingCost + computedTax);

    // Final security check: validate total price matches
    if (pricing.total !== computedTotal) {
      return NextResponse.json({
        error: `Price verification failed. Calculated total: ₹${computedTotal}, received: ₹${pricing.total}. Please try again.`
      }, { status: 400 });
    }

    // Generate unique sequential orderId prefix as RBH and 5 digit suffix using atomic Mongo counter
    const counter = await Counter.findOneAndUpdate(
      { _id: "orderId" },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    const orderId = `RBH-${String(counter.seq).padStart(5, "0")}`;

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
        pricing: {
          subtotal: computedSubtotal,
          shipping: computedShippingCost,
          couponDiscount: computedCouponDiscount,
          total: computedTotal,
        },
        coupon: coupon?.code ? {
          code: coupon.code.toUpperCase(),
          discountAmount: computedCouponDiscount,
        } : undefined,
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
  if (currentStatus === nextStatus) {
    return currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED" && currentStatus !== "REFUNDED";
  }
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
    const userSession = await auth();
    if (!userSession?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      orderId, 
      status, 
      note, 
      deliveryMethod, 
      deliveryPersonName, 
      deliveryPersonPhone, 
      courier, 
      trackingNumber,
      refundPreference 
    } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    // Role-based authorization
    const isAdminOrVendor = userSession.user.role === "admin" || userSession.user.role === "vendor";

    // To perform the operations atomically, we can start a transaction session if supported
    let dbSession: any = null;
    try {
      dbSession = await mongoose.startSession();
      dbSession.startTransaction();
    } catch (sessErr) {
      console.warn("MongoDB replica set / session not supported, falling back to non-transactional execution:", sessErr);
    }

    const sessionOptions = dbSession ? { session: dbSession } : {};

    try {
      const order = await Order.findOne({ orderId }).session(dbSession || null);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const isOwner = order.userId.toString() === userSession.user.id;
      const currentStatus = order.status || "PLACED";

      // 1. Authorize transition
      if (!isAdminOrVendor) {
        if (!isOwner || (status !== "RETURN_REQUESTED" && status !== "CANCELLED")) {
          return NextResponse.json({ error: "Unauthorized status transition" }, { status: 403 });
        }

        if (status === "CANCELLED") {
          const allowedCancelStatuses = ["PLACED", "CONFIRMED", "PACKED"];
          if (!allowedCancelStatuses.includes(currentStatus)) {
            return NextResponse.json({ error: "Cannot cancel order once it has been shipped." }, { status: 400 });
          }
        }

        if (status === "RETURN_REQUESTED") {
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
      }

      if (!isTransitionAllowed(currentStatus, status)) {
        return NextResponse.json({
          error: `Invalid status transition from ${currentStatus} to ${status}. Reverting or invalid bypassing is blocked.`
        }, { status: 400 });
      }

      // 2. Process Shipping Details (if transition to SHIPPED)
      if (status === "SHIPPED") {
        let trackingUrl = "";
        if (deliveryMethod === "THIRD_PARTY" && courier && trackingNumber) {
          const DeliveryPartner = (await import("@/lib/models/DeliveryPartner")).default;
          const partner = await DeliveryPartner.findOne({ name: courier, type: "THIRD_PARTY" }).session(dbSession || null);
          if (partner?.trackingUrlTemplate) {
            trackingUrl = partner.trackingUrlTemplate.replace("{{tracking}}", trackingNumber);
          }
        }
        order.shipping = {
          deliveryMethod,
          deliveryPersonName,
          deliveryPersonPhone,
          courier,
          trackingNumber,
          trackingUrl,
        };
      }

      // 3. Process Refund on Refunded Status (Admin Action)
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

      // 4. Process COD Payment on Delivery
      if (status === "DELIVERED" && order.payment.method === "COD") {
        const { codPaymentReceived } = body;
        if (!codPaymentReceived) {
          return NextResponse.json({ error: "Confirmation of payment collection is required for delivering COD orders." }, { status: 400 });
        }
        order.payment.status = "PAID";
      }

      // 5. Process Cancellation & Refund Preference
      if (status === "CANCELLED" && currentStatus !== "CANCELLED") {
        // Rollback stock atomically using $elemMatch and decrement update
        for (const item of order.items) {
          const updateResult = await Product.updateOne(
            {
              _id: item.productId,
              variants: {
                $elemMatch: { size: item.size, color: item.color }
              }
            },
            {
              $inc: { "variants.$.stock": item.qty }
            },
            sessionOptions
          );
          if (updateResult.modifiedCount === 0) {
            throw new Error(`Failed to restore stock for product ${item.name} size ${item.size} color ${item.color}.`);
          }
        }

        // If prepaid order, process refund preference
        if (order.payment.method !== "COD" && refundPreference) {
          const preference = refundPreference.method === "SAME_METHOD" ? "ORIGINAL" : refundPreference.method;
          
          order.refundDetails = {
            preference,
            upiId: refundPreference.upiId,
            bankDetails: refundPreference.bankDetails ? {
              accountHolderName: refundPreference.bankDetails.holderName,
              bankName: refundPreference.bankDetails.bankName,
              accountNumber: refundPreference.bankDetails.accountNumber,
              ifscCode: refundPreference.bankDetails.ifsc,
            } : undefined,
          };

          if (refundPreference.method === "SAME_METHOD") {
            // Trigger Razorpay refund if possible
            const keyId = process.env.RAZORPAY_KEY_ID;
            const keySecret = process.env.RAZORPAY_KEY_SECRET;
            const paymentId = order.payment.razorpayPaymentId;

            let refundId = "";
            let rzpRefundSuccess = false;

            if (keyId && keySecret && paymentId && !paymentId.startsWith("fake_")) {
              try {
                const Razorpay = (await import("razorpay")).default;
                const razorpay = new Razorpay({
                  key_id: keyId,
                  key_secret: keySecret,
                });
                const refund = await razorpay.payments.refund(paymentId, {
                  amount: Math.round(order.pricing.total * 100),
                  notes: {
                    reason: "Customer cancellation",
                    orderId: order.orderId,
                  }
                });
                refundId = refund.id;
                rzpRefundSuccess = true;
              } catch (rzpErr: any) {
                console.error("Razorpay Auto-Refund Failed:", rzpErr);
              }
            } else {
              // Simulated refund
              refundId = `sim_ref_${Date.now()}`;
              rzpRefundSuccess = true;
            }

            if (rzpRefundSuccess) {
              order.refundDetails.method = "ONLINE";
              order.refundDetails.transactionId = refundId;
              order.refundDetails.refundedAt = new Date();
              order.payment.status = "REFUNDED";
            } else {
              order.payment.status = "REFUND_PENDING";
            }
          } else {
            // Bank transfer or UPI ID, payouts managed by admin manually
            order.payment.status = "REFUND_PENDING";
            order.refundDetails.method = refundPreference.method === "UPI" ? "UPI" : "BANK_TRANSFER";
          }
        }
      }

      if (status !== currentStatus) {
        order.status = status;
        order.statusHistory.push({
          status,
          timestamp: new Date(),
          note: note || `Order status updated to ${status}.`,
        });
      } else if (note) {
        order.statusHistory.push({
          status,
          timestamp: new Date(),
          note,
        });
      }

      // Track performBy in audit logs
      if (!order.auditLogs) {
        order.auditLogs = [];
      }
      order.auditLogs.push({
        action: status !== currentStatus ? `STATUS_UPDATE_${status}` : `METADATA_UPDATE_${status}`,
        performedBy: userSession.user.id,
        timestamp: new Date(),
        details: note || (status !== currentStatus ? `Order status changed to ${status}` : `Order details updated`),
      });

      await order.save(sessionOptions);

      if (dbSession) {
        await dbSession.commitTransaction();
      }

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
    } catch (err: any) {
      if (dbSession) {
        await dbSession.abortTransaction();
      }
      throw err;
    } finally {
      if (dbSession) {
        dbSession.endSession();
      }
    }
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}


