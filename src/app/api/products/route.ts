import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";

function escapeRegExp(string: string) {
  return string.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const brand = searchParams.get("brand");
    const occasion = searchParams.get("occasion");
    const gender = searchParams.get("gender");
    const searchQuery = searchParams.get("search");
    const sort = searchParams.get("sort") || "new";

    const { db, isReady } = await ensureDbReady();
    if (!isReady) {
      throw new Error("Database offline");
    }

    let query: any = { isActive: true };

    // 1. Category filter
    if (categorySlug && categorySlug !== "all") {
      const categoryDoc = await Category.findOne({ slug: categorySlug });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return NextResponse.json([]); // Category not found
      }
    }

    // 2. Brand filter
    if (brand) {
      query.brand = new RegExp(`^${escapeRegExp(brand)}$`, "i");
    }

    // 3. Occasion filter
    if (occasion) {
      query.occasion = occasion;
    }

    // 4. Gender filter
    if (gender) {
      query.gender = gender;
    }

    // 5. Search query matching name, description, brand, tags
    if (searchQuery) {
      const regex = new RegExp(escapeRegExp(searchQuery), "i");
      query.$or = [
        { name: regex },
        { brand: regex },
        { description: regex },
        { tags: regex }
      ];
    }

    let mongooseQuery = Product.find(query).populate({ path: "category", model: Category });

    // Sorting logic
    if (sort === "low") {
      mongooseQuery = mongooseQuery.sort({ salePrice: 1 });
    } else if (sort === "high") {
      mongooseQuery = mongooseQuery.sort({ salePrice: -1 });
    } else if (sort === "rating") {
      mongooseQuery = mongooseQuery.sort({ "rating.average": -1 });
    } else {
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

function sortList(list: any[], sort: string) {
  return list.sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export const dynamic = "force-dynamic";
