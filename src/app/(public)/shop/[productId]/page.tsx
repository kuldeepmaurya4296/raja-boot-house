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
  let productDoc = await Product.findOne({ slug: productId, isActive: true }).populate("category");
  if (!productDoc && productId.match(/^[0-9a-fA-F]{24}$/)) {
    productDoc = await Product.findOne({ _id: productId, isActive: true }).populate("category");
  }

  if (!productDoc) return null;

  const normalizedProduct = normalizeProduct(productDoc);

  // Fetch reviews
  const reviewsDocs = await Review.find({ productId: productDoc._id, isApproved: true })
    .populate({ path: "userId", model: User, select: "name avatar" })
    .sort({ createdAt: -1 });

  // Fetch related products
  const relatedDocs = await Product.find({
    category: productDoc.category,
    _id: { $ne: productDoc._id },
    isActive: true
  }).limit(4).populate("category");

  return {
    product: normalizedProduct,
    reviews: JSON.parse(JSON.stringify(reviewsDocs)),
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
      "name": data.product.vendorId || "Raja Boot House"
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
