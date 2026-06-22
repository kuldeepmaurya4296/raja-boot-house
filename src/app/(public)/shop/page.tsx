import React, { Suspense } from "react";
import { Metadata } from "next";
import mongoose from "mongoose";
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Brand from "@/lib/models/Brand";
import ShopClient from "@/modules/products/components/ShopClient";
import { unstable_cache } from "next/cache";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    occasion?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    limit?: string;
    gender?: string;
    color?: string;
    collection?: string;
  }>;
}

function escapeRegExp(string: string) {
  return string.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}

const getFilterMetadata = unstable_cache(
  async () => {
    const { isReady } = await ensureDbReady();
    if (!isReady) {
      return {
        brands: [],
        sizes: [],
        occasions: [],
        colors: [],
        genders: [],
        maxPrice: 5000,
      };
    }

    try {
      const brandIds = await Product.distinct("brand", { isActive: true });
      const activeBrands = await Brand.find({ _id: { $in: brandIds.filter(Boolean) } })
        .select("name")
        .lean();
      const sortedBrands = activeBrands.map((b: any) => b.name).sort();

      const sizesAgg = await Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$variants" },
        { $group: { _id: null, sizes: { $addToSet: "$variants.size" } } },
      ]);
      const sortedSizes = (sizesAgg[0]?.sizes ?? [])
        .filter((s: any) => typeof s === "number")
        .sort((a: number, b: number) => a - b);

      const occasions = await Product.distinct("occasion", { isActive: true });
      const sortedOccasions = occasions.filter(Boolean).sort();

      const genders = await Product.distinct("gender", { isActive: true });
      const sortedGenders = genders.filter(Boolean).sort();

      const colorsAgg = await Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$variants" },
        {
          $group: {
            _id: { $toLower: "$variants.color" },
            name: { $first: "$variants.color" },
            hex: { $first: "$variants.colorHex" },
          },
        },
      ]);
      const sortedColors = colorsAgg
        .map((c: any) => ({ name: c.name, hex: c.hex }))
        .filter((c: any) => c.name)
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      const maxPriceProduct = await Product.findOne({ isActive: true })
        .sort({ salePrice: -1 })
        .select("salePrice")
        .lean();
      const maxPrice = maxPriceProduct?.salePrice ?? 5000;

      return {
        brands: sortedBrands,
        sizes: sortedSizes,
        occasions: sortedOccasions,
        colors: sortedColors,
        genders: sortedGenders,
        maxPrice,
      };
    } catch (err) {
      console.error("Failed to generate filter metadata:", err);
      return {
        brands: [],
        sizes: [],
        occasions: [],
        colors: [],
        genders: [],
        maxPrice: 5000,
      };
    }
  },
  ["shop-filter-metadata"],
  {
    revalidate: 3600,
    tags: ["filter-metadata"],
  },
);

async function getShopData(filters: any) {
  const { isReady } = await ensureDbReady();
  if (!isReady) {
    console.warn("Database connection is not ready. Returning empty shop catalog data.");
    return {
      categories: [],
      products: [],
      total: 0,
    };
  }

  const {
    category,
    brand,
    occasion,
    search,
    sort,
    minPrice,
    maxPrice,
    size,
    limit,
    gender,
    color,
    collection,
  } = filters;
  const currentLimit = parseInt(limit || "8", 10);

  // 1. Fetch categories with active items
  const categoryIds = await Product.distinct("category", { isActive: true });
  const categoriesList = await Category.find({ _id: { $in: categoryIds } }).lean();

  // 2. Fetch products
  let query: any = { isActive: true };

  // Collection filter
  if (collection) {
    const Collection =
      mongoose.models.Collection || (await import("@/lib/models/Collection")).default;
    const collectionDoc = await Collection.findOne({ slug: collection, isActive: true });
    if (collectionDoc) {
      query._id = { $in: collectionDoc.products };
    } else {
      query._id = new mongoose.Types.ObjectId(); // force empty results
    }
  }

  if (category && category !== "all") {
    const categoryDoc = await Category.findOne({ slug: category });
    if (categoryDoc) {
      query.category = categoryDoc._id;
    } else {
      query.category = new mongoose.Types.ObjectId(); // force empty results
    }
  }

  if (brand) {
    const brandNames = brand.split(",").map((b: string) => b.trim());
    const matchedBrands = await Brand.find({
      name: { $in: brandNames.map((b: string) => new RegExp(`^${escapeRegExp(b)}$`, "i")) },
    })
      .select("_id")
      .lean();
    const brandIds = matchedBrands.map((b: any) => b._id);
    query.brand = { $in: brandIds };
  }

  if (occasion) {
    query.occasion = occasion;
  }

  if (search) {
    const regex = new RegExp(escapeRegExp(search), "i");
    const matchedBrands = await Brand.find({ name: regex }).select("_id").lean();
    const brandIds = matchedBrands.map((b: any) => b._id);

    query.$or = [{ name: regex }, { description: regex }, { tags: regex }];
    if (brandIds.length > 0) {
      query.$or.push({ brand: { $in: brandIds } });
    }
  }

  if (minPrice || maxPrice) {
    query.salePrice = {};
    if (minPrice) {
      query.salePrice.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.salePrice.$lte = parseFloat(maxPrice);
    }
  }

  if (gender) {
    const genderArray = gender
      .split(",")
      .map((g: string) => new RegExp(`^${escapeRegExp(g.trim())}$`, "i"));
    query.gender = { $in: genderArray };
  }

  const variantConditions: any = { stock: { $gt: 0 } };
  let hasVariantQuery = false;

  if (size) {
    const sizeArray = size.split(",").map((s: string) => parseInt(s.trim(), 10));
    variantConditions.size = { $in: sizeArray };
    hasVariantQuery = true;
  }

  if (color) {
    const colorArray = color
      .split(",")
      .map((c: string) => new RegExp(`^${escapeRegExp(c.trim())}$`, "i"));
    variantConditions.color = { $in: colorArray };
    hasVariantQuery = true;
  }

  if (hasVariantQuery) {
    query.variants = {
      $elemMatch: variantConditions,
    };
  }

  const total = await Product.countDocuments(query);
  let mongooseQuery = Product.find(query)
    .populate({ path: "category", model: Category })
    .populate({ path: "brand", model: Brand });

  if (sort === "low") {
    mongooseQuery = mongooseQuery.sort({ salePrice: 1 });
  } else if (sort === "high") {
    mongooseQuery = mongooseQuery.sort({ salePrice: -1 });
  } else if (sort === "rating") {
    mongooseQuery = mongooseQuery.sort({ "rating.average": -1 });
  } else {
    mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
  }

  const rawProducts = await mongooseQuery.limit(currentLimit).exec();
  const products = rawProducts.map((p: any) => normalizeProduct(p));

  return {
    categories: JSON.parse(JSON.stringify(categoriesList)),
    products,
    total,
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { category, search } = await searchParams;
  let title = "Footwear Catalog — Raja Boot House";
  let description = "Browse our exclusive leather collection.";

  if (category && category !== "all") {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} Footwear — Raja Boot House`;
  }
  if (search) {
    title = `Search results for "${search}" — Raja Boot House`;
  }

  let canonicalPath = "/shop";
  if (category && category !== "all") {
    canonicalPath = `/shop?category=${category}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const [data, filterMetadata] = await Promise.all([getShopData(filters), getFilterMetadata()]);

  const { category } = filters;
  let canonicalPath = "/shop";
  if (category && category !== "all") {
    canonicalPath = `/shop?category=${category}`;
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name:
      category && category !== "all"
        ? `${category.charAt(0).toUpperCase() + category.slice(1)} Footwear`
        : "Footwear Catalog",
    description: "Browse our premium footwear collection at Raja Boot House.",
    url: `https://rbh.maurya-tech.com${canonicalPath}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.total,
      itemListElement: data.products.slice(0, 12).map((product: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://rbh.maurya-tech.com/shop/${product.slug}`,
      })),
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://rbh.maurya-tech.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: "https://rbh.maurya-tech.com/shop",
      },
      ...(category && category !== "all"
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.charAt(0).toUpperCase() + category.slice(1),
              item: `https://rbh.maurya-tech.com/shop?category=${category}`,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Suspense
        fallback={
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground text-sm font-semibold">
              Loading catalog styles...
            </p>
          </div>
        }
      >
        <ShopClient
          categories={data.categories}
          initialProducts={data.products}
          totalProducts={data.total}
          filterMetadata={filterMetadata}
        />
      </Suspense>
    </>
  );
}
