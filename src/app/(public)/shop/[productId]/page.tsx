import React from "react";
import { Metadata } from "next";
import Product from "@/lib/models/Product";
import Review from "@/lib/models/Review";
import Category from "@/lib/models/Category";
import User from "@/lib/models/User"; // needed for reviews user populate
import { ensureDbReady, normalizeProduct } from "@/lib/db-utils";
import ProductClient from "@/modules/products/components/ProductClient";
import Link from "next/link";

interface PageProps {
  params: Promise<{ productId: string }>;
}

async function getProductData(productId: string) {
  const { isReady } = await ensureDbReady();
  if (!isReady) {
    console.warn("Database connection is not ready. Returning null product data.");
    return null;
  }
  
  // Try finding by slug first, then by ObjectId id
  let productDoc = await Product.findOne({ slug: productId, isActive: true }).populate({ path: "category", model: Category });
  if (!productDoc && productId.match(/^[0-9a-fA-F]{24}$/)) {
    productDoc = await Product.findOne({ _id: productId, isActive: true }).populate({ path: "category", model: Category });
  }

  if (!productDoc) return null;

  const normalizedProduct = normalizeProduct(productDoc);

  // Fetch reviews
  const reviewsDocs = await Review.find({ productId: productDoc._id, isApproved: true })
    .populate({ path: "userId", model: User, select: "name avatar" })
    .sort({ createdAt: -1 });

  // Calculate reviewNumber chronologically per user
  const userReviewCounts: Record<string, number> = {};
  const sortedChronologically = [...reviewsDocs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const reviewNumbers: Record<string, number> = {};
  sortedChronologically.forEach((r) => {
    const uId = r.userId && typeof r.userId === "object" && "_id" in r.userId ? (r.userId as any)._id.toString() : r.userId?.toString() || "anonymous";
    if (!userReviewCounts[uId]) {
      userReviewCounts[uId] = 0;
    }
    userReviewCounts[uId]++;
    reviewNumbers[r._id.toString()] = userReviewCounts[uId];
  });

  const mappedReviews = reviewsDocs.map((r: any) => ({
    id: r._id.toString(),
    productId: r.productId.toString(),
    userName: r.userId && typeof r.userId === "object" && "name" in r.userId ? (r.userId as any).name : "Anonymous",
    userId: r.userId && typeof r.userId === "object" && "_id" in r.userId ? (r.userId as any)._id.toString() : r.userId?.toString() || "",
    userAvatar: r.userId && typeof r.userId === "object" && "avatar" in r.userId ? (r.userId as any).avatar : undefined,
    rating: r.rating,
    title: r.title || "",
    body: r.comment || "",
    images: r.images || [],
    createdAt: new Date(r.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    verified: r.isVerifiedPurchase || false,
    reviewNumber: reviewNumbers[r._id.toString()] || 1,
    helpfulVotes: r.helpfulVotes || 0
  }));

  // Fetch related products
  const relatedDocs = await Product.find({
    category: productDoc.category,
    _id: { $ne: productDoc._id },
    isActive: true
  }).limit(4).populate({ path: "category", model: Category });

  return {
    product: normalizedProduct,
    reviews: mappedReviews,
    related: relatedDocs.map(p => normalizeProduct(p))
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const { isReady } = await ensureDbReady();
  
  let product = null;
  if (isReady) {
    product = await Product.findOne({ slug: productId, isActive: true });
    if (!product && productId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findOne({ _id: productId, isActive: true });
    }
  }

  if (!product) {
    return {
      title: "Product Not Found — Raja Boot House",
      description: "This footwear style is not available."
    };
  }

  return {
    title: `${product.name} — Raja Boot House`,
    description: product.description?.slice(0, 160) || `Buy ${product.name} at Raja Boot House.`,
    openGraph: {
      title: `${product.name} — Raja Boot House`,
      description: product.description?.slice(0, 160),
      images: [{ url: product.images?.[0]?.url || "/assets/product-placeholder.jpg" }]
    }
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;
  const data = await getProductData(productId);

  if (!data) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The style you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="underline font-semibold text-primary">
          Back to shop
        </Link>
      </div>
    );
  }

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.product.name,
    "image": data.product.gallery,
    "description": data.product.description,
    "sku": data.product.id,
    "brand": {
      "@type": "Brand",
      "name": data.product.brand || "Raja Boot House"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://rajaboothouse.com/shop/${data.product.slug}`,
      "priceCurrency": "INR",
      "price": data.product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": data.product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": data.product.reviewsCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": data.product.rating,
      "reviewCount": data.product.reviewsCount
    } : undefined
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient
        product={data.product}
        initialReviews={data.reviews}
        relatedProducts={data.related}
      />
    </>
  );
}
