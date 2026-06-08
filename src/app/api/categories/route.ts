import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
