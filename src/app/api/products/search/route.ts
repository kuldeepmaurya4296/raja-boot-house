import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { products as fallbackProducts } from "@/data/products";
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const { db, isReady } = await ensureDbReady();
    if (!isReady) {
      console.warn("Using local mock products fallback for search (database offline).");
      const normalizedQuery = query.toLowerCase().trim();
      const results = fallbackProducts.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(normalizedQuery) ||
          p.description?.toLowerCase().includes(normalizedQuery) ||
          p.vendorId?.toLowerCase().includes(normalizedQuery) ||
          p.category?.toLowerCase().includes(normalizedQuery)
      );
      return NextResponse.json(results);
    }

    // Search query matches name, brand, description, tags, category slug
    const regex = new RegExp(query, "i");

    // Fetch categories matching the query to also search by category names/slugs
    const matchingCategories = await Category.find({
      $or: [{ name: regex }, { slug: regex }],
    });
    const categoryIds = matchingCategories.map((c) => c._id);

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: regex },
        { brand: regex },
        { description: regex },
        { tags: regex },
        { category: { $in: categoryIds } },
      ],
    }).populate("category");

    const normalized = products.map((p: any) => normalizeProduct(p));

    return NextResponse.json(normalized);
  } catch (error: any) {
    console.error("Search API failed:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during search query resolution" },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic";
