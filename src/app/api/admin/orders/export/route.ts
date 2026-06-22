import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "admin" && session.user.role !== "vendor")) {
      return new Response("Unauthorized. Administrative privileges required.", { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const statusFilter = searchParams.get("status") || "";

    const query: any = {
      $or: [{ "payment.method": "COD" }, { "payment.status": { $ne: "PENDING" } }],
    };
    if (statusFilter && statusFilter.toUpperCase() !== "ALL") {
      query.status = statusFilter.toUpperCase();
    }
    if (q) {
      query.orderId = { $regex: q, $options: "i" };
    }

    const orders = await Order.find(query)
      .populate({ path: "userId", model: User, select: "name email" })
      .sort({ createdAt: -1 })
      .lean();

    const csvRows = [
      [
        "Order ID",
        "Customer Name",
        "Customer Email",
        "Created At",
        "Status",
        "Payment Method",
        "Payment Status",
        "Items Count",
        "Items Details",
        "Subtotal (INR)",
        "Coupon Code",
        "Coupon Discount (INR)",
        "Shipping (INR)",
        "Total (INR)",
        "Shipping Name",
        "Shipping Phone",
        "Shipping Address",
        "Courier",
        "Tracking Number",
      ]
        .map((field) => `"${field.replace(/"/g, '""')}"`)
        .join(","),
    ];

    for (const order of orders) {
      // Format items detail
      const itemsDetail = (order.items || [])
        .map((it: any) => `${it.name} (UK ${it.size}, ${it.color}) x${it.qty} [₹${it.price}]`)
        .join(" | ");

      const addressObj = order.shippingAddress || {};
      const fullAddress = [
        addressObj.line1 || "",
        addressObj.line2 || "",
        addressObj.city || "",
        addressObj.state || "",
        addressObj.pin || "",
        addressObj.country || "",
      ]
        .filter(Boolean)
        .join(", ");

      const row = [
        order.orderId || order._id.toString(),
        (order.userId as any)?.name || "Guest",
        (order.userId as any)?.email || "",
        order.createdAt ? new Date(order.createdAt).toISOString() : "",
        order.status || "",
        order.payment?.method || "",
        order.payment?.status || "",
        (order.items || []).length.toString(),
        itemsDetail,
        (order.pricing?.subtotal || 0).toString(),
        order.coupon?.code || "",
        (order.pricing?.couponDiscount || 0).toString(),
        (order.pricing?.shipping || 0).toString(),
        (order.pricing?.total || 0).toString(),
        addressObj.fullName || "",
        addressObj.phone || "",
        fullAddress,
        order.shipping?.courier || "",
        order.shipping?.trackingNumber || "",
      ];

      csvRows.push(row.map((field) => `"${(field || "").replace(/"/g, '""')}"`).join(","));
    }

    const csvContent = csvRows.join("\n");
    const filename = `orders_export_${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Failed to generate orders CSV:", error);
    return new Response("Failed to generate orders CSV: " + error.message, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
