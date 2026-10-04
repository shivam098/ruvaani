import type { MetadataRoute } from "next";
import { isDemoMode, siteUrl } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return { rules: isDemoMode() ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/account", "/checkout", "/cart", "/wishlist"] }, sitemap: `${siteUrl()}/sitemap.xml` };
}
