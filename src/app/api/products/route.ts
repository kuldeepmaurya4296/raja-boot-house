import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { products as fallbackProducts } from "@/data/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const sort = searchParams.get("sort") || "new";

    const db = await connectToDatabase();
    if (!db) {
      console.warn("Using local mock products fallback (database offline).");
      let list = [...fallbackProducts];
      if (categorySlug && categorySlug !== "all") {
        list = list.filter((p) => p.category === categorySlug);
      }
      return NextResponse.json(sortList(list, sort));
    }

    let query: any = { isActive: true };

    if (categorySlug && categorySlug !== "all") {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Category slug not found, return empty
        return NextResponse.json([]);
      }
    }

    let mongooseQuery = Product.find(query).populate("category");

    // Sorting logic
    if (sort === "low") {
      mongooseQuery = mongooseQuery.sort({ salePrice: 1 });
    } else if (sort === "high") {
      mongooseQuery = mongooseQuery.sort({ salePrice: -1 });
    } else if (sort === "rating") {
      mongooseQuery = mongooseQuery.sort({ "rating.average": -1 });
    } else {
      // Default to newest
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    const rawProducts = await mongooseQuery.exec();
    const normalized = rawProducts.map((p: any) => normalizeProduct(p));
    return NextResponse.json(normalized);
  } catch (error: any) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch products" }, { status: 500 });
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

function sortList(list: any[], sort: string) {
  return list.sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export const dynamic = "force-dynamic";
