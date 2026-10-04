import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { isDemoMode, siteUrl } from "@/lib/config";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isDemoMode()) return [];
  const paths = ["", "/shop", "/corporate", "/about", "/contact", "/faq", "/gift-finder", ...(await getProducts()).map((p) => `/products/${p.slug}`)];
  return paths.map((path) => ({ url: `${siteUrl()}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 }));
}
