import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/account/", "/api/"],
    },
    sitemap: "https://rajaboothouse.com/sitemap.xml",
  };
}
