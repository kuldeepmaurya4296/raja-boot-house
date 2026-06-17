import mongoose from "mongoose";
import { connectToDatabase } from "./db";

export async function ensureDbReady() {
  const db = await connectToDatabase();
  const isReady = db && mongoose.connection.readyState === 1;
  return { db, isReady };
}

// Helper to safely convert any Mongoose ObjectId / BSON value to a plain string
function toStr(val: any): string | undefined {
  if (val == null) return undefined;
  if (typeof val === "string") return val;
  if (typeof val.toString === "function") return val.toString();
  return undefined;
}

export function normalizeProduct(p: any) {
  // Resolve brand name — handle populated doc, raw ObjectId, or plain string
  let brandName: string;
  if (p.brand && typeof p.brand === "object" && "name" in p.brand) {
    brandName = p.brand.name;
  } else if (typeof p.brand === "string") {
    brandName = p.brand;
  } else {
    brandName =
      p.vendorId === "v1" ? "Lakhani" :
      p.vendorId === "v2" ? "Touch" :
      p.vendorId === "v3" ? "Paragon" :
      p.vendorId === "v4" ? "Goldstar" :
      "Raja Boot House";
  }

  // Resolve brandId — only keep it as a string
  let brandId: string | undefined;
  if (p.brand && typeof p.brand === "object" && p.brand._id) {
    brandId = p.brand._id.toString();
  } else if (typeof p.brand === "string") {
    brandId = p.brand;
  }

  // Resolve category slug safely
  const category =
    (p.category && typeof p.category === "object" && p.category.slug)
      ? p.category.slug
      : (typeof p.category === "string" ? p.category : "shoes");

  return {
    id: p._id ? p._id.toString() : (p.id || ""),
    slug: p.slug || "",
    name: p.name || "",
    category,
    brand: brandName,
    brandId,
    vendorId: toStr(p.vendorId),
    price: p.salePrice !== undefined ? Number(p.salePrice) : Number(p.price || 0),
    compareAt: p.salePrice !== undefined ? Number(p.price) : (p.compareAt !== undefined ? Number(p.compareAt) : undefined),
    variants: p.variants ? p.variants.map((v: any) => ({
      size: v.size,
      color: v.color || "",
      colorHex: v.colorHex || "",
      stock: Number(v.stock || 0),
      sku: v.sku || "",
      images: v.images ? v.images.map((img: any) => ({ url: String(img.url || ""), public_id: String(img.public_id || "") })) : [],
    })) : [],
    image: p.images && p.images[0] ? String(p.images[0].url) : (p.image || "/assets/product-placeholder.jpg"),
    gallery: p.images ? p.images.map((img: any) => String(img.url)) : (p.gallery || []),
    description: p.description || "",
    details: p.tags && p.tags.length > 0 ? p.tags.map(String) : (p.details || ["Premium craftsmanship", "Durability assured"]),
    colors: Array.from(new Set(p.variants ? p.variants.map((v: any) => String(v.color || "")) : (p.colors || []))) as string[],
    sizes: Array.from(new Set(p.variants ? p.variants.map((v: any) => Number(v.size)) : (p.sizes || []))) as number[],
    stock: p.variants ? p.variants.reduce((acc: number, v: any) => acc + Number(v.stock || 0), 0) : (p.stock !== undefined ? Number(p.stock) : 0),
    rating: p.rating ? (typeof p.rating === "number" ? p.rating : Number(p.rating.average || 4.5)) : 4.5,
    reviewsCount: p.rating ? (typeof p.rating === "number" ? (p.reviewsCount || 0) : Number(p.rating.count || 0)) : (p.reviewsCount || 0),
    badge: (p.isFeatured ? "bestseller" : p.isNewArrival ? "new" : p.badge) as "new" | "bestseller" | "sale" | undefined,
    createdAt: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString().split("T")[0] : String(p.createdAt)) : "2025-06-08",
  };
}

export async function updateProductRating(productId: string) {
  const Review = mongoose.models.Review || (await import("./models/Review")).default;
  const Product = mongoose.models.Product || (await import("./models/Product")).default;
  
  const allReviews = await Review.find({ productId, isApproved: true });
  
  // Group reviews by userId
  const reviewsByUser: Record<string, any[]> = {};
  allReviews.forEach((r) => {
    const uId = r.userId.toString();
    if (!reviewsByUser[uId]) {
      reviewsByUser[uId] = [];
    }
    reviewsByUser[uId].push(r);
  });

  // Select only the review with the highest rating for each user
  const selectedReviews = Object.values(reviewsByUser).map((userReviews) => {
    return userReviews.reduce((highest, current) => {
      return current.rating > highest.rating ? current : highest;
    });
  });

  const count = selectedReviews.length;
  const average = count > 0 ? selectedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

  await Product.findByIdAndUpdate(productId, {
    "rating.average": parseFloat(average.toFixed(1)),
    "rating.count": count,
  });
}
