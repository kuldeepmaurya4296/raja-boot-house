import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/models/Category";
import { categories as fallbackCategories } from "@/data/categories";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      console.warn("Using local mock categories fallback (database offline).");
      return NextResponse.json(fallbackCategories);
    }

    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
