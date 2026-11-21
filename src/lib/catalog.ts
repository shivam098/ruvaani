import { cache } from "react";
import { catalogueProducts, type CatalogueItem, categories } from "./catalog-data";
import { connectDb } from "./db";
import { ProductModel } from "./models";

export const getProducts = cache(async (): Promise<CatalogueItem[]> => {
  try {
    await connectDb();
    const dbProducts = await ProductModel.find({ active: true }).lean();
    if (dbProducts && dbProducts.length > 0) {
      const mappedDbProducts: CatalogueItem[] = dbProducts.map((p) => {
        const match = catalogueProducts.find((cp) => cp.id === p.id || cp.slug === p.slug);
        const validCategory = (categories as readonly string[]).includes(p.category)
          ? (p.category as (typeof categories)[number])
          : match?.category || "Curated hampers";

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          subtitle: p.subtitle || match?.subtitle || "Thoughtfully curated gifting",
          description: p.description || match?.description || p.name,
          category: validCategory,
          image: p.images?.[0] || match?.image || `/catalogue/${p.slug}.webp`,
          imageAlt: match?.imageAlt || `${p.name} from RUVAANI`,
          sheet: match?.sheet,
          sheetSize: match?.sheetSize,
          cataloguePrice: p.price ?? match?.cataloguePrice,
          priceType: match?.priceType,
          occasion: (p.occasions && p.occasions[0]) || match?.occasion,
          contents: (p.includes && p.includes.length > 0) ? p.includes : match?.contents,
          personalizable: Boolean(p.personalizable),
          featured: Boolean(p.featured),
          source: match?.source || "MongoDB Product Inventory",
        };
      });

      const existingIds = new Set(mappedDbProducts.map((p) => p.id));
      const combined = [...mappedDbProducts];
      for (const cp of catalogueProducts) {
        if (!existingIds.has(cp.id)) {
          combined.push(cp);
        }
      }
      return combined;
    }
  } catch {
    // Graceful fallback to static catalogue when MongoDB is not connected
  }
  return catalogueProducts;
});
