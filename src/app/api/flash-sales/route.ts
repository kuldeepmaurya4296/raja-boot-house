import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import FlashSale from "@/lib/models/FlashSale";

export async function GET() {
  try {
    await connectToDatabase();
    const now = new Date();

    // Find active flash sales and populate products
    const activeSales = await FlashSale.find({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })
      .populate("products")
      .lean();

    return NextResponse.json(activeSales);
  } catch (error: any) {
    console.error("Failed to fetch active flash sales:", error);
    return NextResponse.json({ error: "Failed to fetch active flash sales" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
