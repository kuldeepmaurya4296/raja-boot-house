import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Local order ID (e.g. RBH-...)
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: "Missing verification parameters" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.warn("RAZORPAY_KEY_SECRET not set. Proceeding with simulated validation.");
    } else {
      // Verify signature
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Payment verification failed: Invalid signature" }, { status: 400 });
      }
    }

    await connectToDatabase();

    // Update order status in database
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 44 });
    }

    // Check if order payment is already PAID to avoid double-processing
    if (order.payment.status === "PAID") {
      return NextResponse.json({ success: true, message: "Payment already verified", order });
    }

    order.payment.razorpayOrderId = razorpay_order_id;
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.status = "PAID";
    order.status = "CONFIRMED";
    order.statusHistory.push({
      status: "CONFIRMED",
      timestamp: new Date(),
      note: `Payment verified. Transaction ID: ${razorpay_payment_id}`,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (error: any) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during payment verification" },
      { status: 500 }
    );
  }
}
