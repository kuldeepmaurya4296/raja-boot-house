import mongoose from "mongoose";
import { connectToDatabase } from "./db";

export async function ensureDbReady() {
  const db = await connectToDatabase();
  const isReady = db && mongoose.connection.readyState === 1;
  return { db, isReady };
}

export function normalizeProduct(p: any) {
  const brandName = (p.brand && typeof p.brand === "object" && "name" in p.brand)
    ? p.brand.name
    : (p.brand || (
        p.vendorId === "v1" ? "Lakhani" : 
        p.vendorId === "v2" ? "Touch" : 
        p.vendorId === "v3" ? "Paragon" : 
        p.vendorId === "v4" ? "Goldstar" : 
        p.vendorId || "Raja Boot House"
      ));

  return {
    id: p._id ? p._id.toString() : p.id,
    slug: p.slug,
    name: p.name,
    category: p.category && p.category.slug ? p.category.slug : "shoes",
    brand: brandName,
    brandId: p.brand && p.brand._id ? p.brand._id.toString() : (typeof p.brand === "string" ? p.brand : undefined),
    vendorId: p._id ? (p.vendorId ? p.vendorId.toString() : undefined) : p.vendorId,
    price: p.salePrice !== undefined ? p.salePrice : p.price,
    compareAt: p.salePrice !== undefined ? p.price : p.compareAt,
    variants: p.variants ? p.variants.map((v: any) => ({
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      stock: v.stock,
      sku: v.sku,
      images: v.images ? v.images.map((img: any) => ({ url: img.url, public_id: img.public_id })) : [],
    })) : [],
    image: p.images && p.images[0] ? p.images[0].url : (p.image || "/assets/product-placeholder.jpg"),
    gallery: p.images ? p.images.map((img: any) => img.url) : (p.gallery || []),
    description: p.description,
    details: p.tags && p.tags.length > 0 ? p.tags : (p.details || ["Premium craftsmanship", "Durability assured"]),
    colors: Array.from(new Set(p.variants ? p.variants.map((v: any) => v.color) : (p.colors || []))) as string[],
    sizes: Array.from(new Set(p.variants ? p.variants.map((v: any) => v.size) : (p.sizes || []))) as number[],
    stock: p.variants ? p.variants.reduce((acc: number, v: any) => acc + v.stock, 0) : (p.stock !== undefined ? p.stock : 0),
    rating: p.rating ? (typeof p.rating === "number" ? p.rating : p.rating.average) : 4.5,
    reviewsCount: p.rating ? (typeof p.rating === "number" ? p.reviewsCount : p.rating.count) : (p.reviewsCount || 0),
    badge: (p.isFeatured ? "bestseller" : p.isNewArrival ? "new" : p.badge) as "new" | "bestseller" | "sale" | undefined,
    createdAt: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString().split("T")[0] : p.createdAt) : "2025-06-08",
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
