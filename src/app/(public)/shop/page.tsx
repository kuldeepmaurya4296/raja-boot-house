import React, { Suspense } from "react";
import { Metadata } from "next";
import mongoose from "mongoose";
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ShopClient from "@/modules/products/components/ShopClient";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    occasion?: string;
    search?: string;
    sort?: string;
  }>;
}

function escapeRegExp(string: string) {
  return string.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}

async function getShopData(filters: any) {
  const { isReady } = await ensureDbReady();
  if (!isReady) {
    console.warn("Database connection is not ready. Returning empty shop catalog data.");
    return {
      categories: [],
      products: []
    };
  }

  const { category, brand, occasion, search, sort } = filters;

  // 1. Fetch categories
  const categoriesList = await Category.find().lean();

  // 2. Fetch products
  let query: any = { isActive: true };

  if (category && category !== "all") {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    } else {
      query.category = new mongoose.Types.ObjectId(); // force empty results
    }
  }

  if (brand) {
    query.brand = new RegExp(`^${escapeRegExp(brand)}$`, "i");
  }

  if (occasion) {
    query.occasion = occasion;
  }

  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    query.$or = [
      { name: regex },
      { brand: regex },
      { description: regex },
      { tags: regex }
    ];
  }

  let mongooseQuery = Product.find(query).populate({ path: "category", model: Category });

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
  const products = rawProducts.map((p: any) => normalizeProduct(p));

  return {
    categories: JSON.parse(JSON.stringify(categoriesList)),
    products
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { category, search } = await searchParams;
  let title = "Footwear Catalog — Raja Boot House";
  let description = "Browse our exclusive handcrafted leather collection since 1972.";

  if (category && category !== "all") {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} Footwear — Raja Boot House`;
  }
  if (search) {
    title = `Search results for "${search}" — Raja Boot House`;
  }

  return {
    title,
    description
  };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const data = await getShopData(filters);

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-sm font-semibold">Loading catalog styles...</p>
        </div>
      }
    >
      <ShopClient
        categories={data.categories}
        initialProducts={data.products}
      />
    </Suspense>
  );
}
