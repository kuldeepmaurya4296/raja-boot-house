import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else {
      console.warn("RAZORPAY_WEBHOOK_SECRET not defined. Skipping verification.");
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const payload = body.payload;

    console.log(`Received Razorpay webhook event: ${event}`);

    await connectToDatabase();

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payment?.entity;
      const orderEntity = payload.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });
        if (order) {
          if (order.payment.status !== "PAID") {
            order.payment.status = "PAID";
            if (razorpayPaymentId) {
              order.payment.razorpayPaymentId = razorpayPaymentId;
            }
            order.status = "CONFIRMED";
            order.statusHistory.push({
              status: "CONFIRMED",
              timestamp: new Date(),
              note: `Webhook received: ${event}. Payment verified.`,
            });
            await order.save();
            console.log(`Order ${order.orderId} updated to PAID via Webhook.`);
          }
        } else {
          console.warn(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
