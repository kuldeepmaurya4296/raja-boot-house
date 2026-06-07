import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { products as fallbackProducts } from "@/data/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const db = await connectToDatabase();
    if (!db) {
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

    const normalized = products.map((p: any) => ({
      id: p._id.toString(),
      slug: p.slug,
      name: p.name,
      category: p.category && p.category.slug ? p.category.slug : "shoes",
      vendorId: p.brand,
      price: p.salePrice,
      compareAt: p.price,
      image: p.images && p.images[0] ? p.images[0].url : "/assets/product-placeholder.jpg",
      gallery: p.images ? p.images.map((img: any) => img.url) : [],
      description: p.description,
      details: p.tags && p.tags.length > 0 ? p.tags : ["Premium craftsmanship", "Durability assured"],
      colors: Array.from(new Set(p.variants ? p.variants.map((v: any) => v.color) : [])),
      sizes: Array.from(new Set(p.variants ? p.variants.map((v: any) => v.size) : [])),
      stock: p.variants ? p.variants.reduce((acc: number, v: any) => acc + v.stock, 0) : 0,
      rating: p.rating ? p.rating.average : 4.5,
      reviewsCount: p.rating ? p.rating.count : 0,
      badge: p.isFeatured ? "bestseller" : p.isNewArrival ? "new" : undefined,
      createdAt: p.createdAt ? p.createdAt.toISOString().split("T")[0] : "2025-06-08",
    }));

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
