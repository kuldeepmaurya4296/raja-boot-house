import mongoose from "mongoose";
import { connectToDatabase } from "./db";

export async function ensureDbReady() {
  const db = await connectToDatabase();
  const isReady = db && mongoose.connection.readyState === 1;
  return { db, isReady };
}

export function normalizeProduct(p: any) {
  return {
    id: p._id ? p._id.toString() : p.id,
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
    createdAt: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString().split("T")[0] : p.createdAt) : "2025-06-08",
  };
}
