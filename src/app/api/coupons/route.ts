import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Coupon from "@/lib/models/Coupon";
import { coupons as fallbackCoupons } from "@/data/coupons";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      console.warn("Using local mock coupons fallback (database offline).");
      return NextResponse.json(fallbackCoupons);
    }

    const coupons = await Coupon.find({ isActive: true });
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
