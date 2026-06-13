import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";
import Review from "@/lib/models/Review";
import Product from "@/lib/models/Product";
import User from "@/lib/models/User";
import { auth } from "@/lib/auth";
import Order from "@/lib/models/Order";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId parameter is required" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    const reviews = await Review.find({ productId, isApproved: true })
      .populate({ path: "userId", model: User, select: "name avatar" })
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, rating, title, comment, body, images } = await request.json();

    if (!productId || !rating) {
      return NextResponse.json({ error: "productId and rating are required fields" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      throw new Error("Database offline");
    }

    // Check if user has purchased the item
    const deliveredOrder = await Order.findOne({
      userId: session.user.id,
      "items.productId": productId,
      status: "DELIVERED",
    });

    const isVerifiedPurchase = !!deliveredOrder;

    // Create review entry
    const newReview = await Review.create({
      productId,
      userId: session.user.id,
      rating,
      title: title || "",
      comment: comment || body || "",
      images: images || [],
      isApproved: false, // Requires admin moderation
      isVerifiedPurchase,
    });

    // Update Product average rating using existing approved reviews
    const allReviews = await Review.find({ productId, isApproved: true });
    const count = allReviews.length;
    const average = count > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await Product.findByIdAndUpdate(productId, {
      "rating.average": parseFloat(average.toFixed(1)),
      "rating.count": count,
    });

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

