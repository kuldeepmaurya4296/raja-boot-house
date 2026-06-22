import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn(
        "Razorpay environment variables are missing. Simulating Razorpay order creation.",
      );
      const fakeRzpOrderId = `fake_rzp_order_${Date.now()}`;
      try {
        await connectToDatabase();
        const updateResult = await Order.updateOne(
          { orderId: receipt },
          { "payment.razorpayOrderId": fakeRzpOrderId },
        );
        console.log(
          `Associated simulated Razorpay order ID ${fakeRzpOrderId} with local order ${receipt}. Modified count: ${updateResult.modifiedCount}`,
        );
      } catch (dbErr) {
        console.error("Failed to associate fake razorpayOrderId with local order:", dbErr);
      }
      return NextResponse.json({
        id: fakeRzpOrderId,
        amount: Math.round(amount * 100),
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        simulated: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Razorpay amount is in paise (lowest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Save razorpayOrderId to MongoDB Order document
    try {
      await connectToDatabase();
      const updateResult = await Order.updateOne(
        { orderId: order.receipt },
        { "payment.razorpayOrderId": order.id },
      );
      console.log(
        `Associated Razorpay order ID ${order.id} with local order ${order.receipt}. Modified count: ${updateResult.modifiedCount}`,
      );
    } catch (dbErr) {
      console.error("Failed to associate razorpayOrderId with local order:", dbErr);
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 },
    );
  }
}
