import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat: any) => {
        const productCount = await Product.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat,
          id: cat._id.toString(),
          productCount,
        };
      }),
    );
    return NextResponse.json(categoriesWithCount);
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export const revalidate = 3600;
