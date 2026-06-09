import { MetadataRoute } from "next";
import { ensureDbReady } from "@/lib/db-utils";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { isReady } = await ensureDbReady();
    const baseUrl = "https://rajaboothouse.com";

    const staticRoutes = [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/shop`, lastModified: new Date() },
      { url: `${baseUrl}/cart`, lastModified: new Date() },
    ];

    if (!isReady) {
      console.warn("Database connection is not ready. Returning static routes in sitemap.");
      return staticRoutes;
    }

    const products = await Product.find({ isActive: true }).select("slug updatedAt");
    const categories = await Category.find().select("slug");

    const categoryRoutes = categories.map((c) => ({
      url: `${baseUrl}/shop?category=${c.slug}`,
      lastModified: new Date(),
    }));

    const productRoutes = products.map((p) => ({
      url: `${baseUrl}/shop/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (err) {
    console.error("Failed to generate sitemap:", err);
    return [
      { url: "https://rajaboothouse.com", lastModified: new Date() },
      { url: "https://rajaboothouse.com/shop", lastModified: new Date() },
    ];
  }
}
