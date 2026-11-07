import type { MetadataRoute } from "next";
import { guides, products } from "@/lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://danielbooneoutdoors.com";
  const staticPaths = ["", "/trending", "/packs-and-bags", "/camp-and-hike", "/carry", "/fishing", "/wear", "/shop", "/guides", "/about", "/policies"];

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path || "/"}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...products.map((product) => ({ url: `${base}/products/${product.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...guides.map((guide) => ({ url: `${base}/guides/${guide.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
