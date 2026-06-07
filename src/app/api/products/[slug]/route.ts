import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import { products as fallbackProducts } from "@/data/products";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const db = await connectToDatabase();
    if (!db) {
      console.warn("Using local mock product detail fallback (database offline).");
      // Fallback matching slug or id
      const matched = fallbackProducts.find((p) => p.slug === slug || p.id === slug);
      if (!matched) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(matched);
    }

    // Try finding by slug first, then by ObjectId id
    let product = await Product.findOne({ slug, isActive: true }).populate("category");
    if (!product && slug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({ _id: slug, isActive: true }).populate("category");
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(normalizeProduct(product));
  } catch (error: any) {
    console.error("Failed to fetch product details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

function normalizeProduct(p: any) {
  return {
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
  };
}

export const dynamic = "force-dynamic";
