import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import { products as fallbackProducts } from "@/data/products";
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const { db, isReady } = await ensureDbReady();
    if (!isReady) {
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

export const dynamic = "force-dynamic";
