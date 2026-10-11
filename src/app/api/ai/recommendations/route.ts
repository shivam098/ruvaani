import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/lib/models";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const category = searchParams.get("category");
    const occasion = searchParams.get("occasion");
    const limit = Math.min(parseInt(searchParams.get("limit") || "4", 10), 12);

    await connectDb();

    const query: Record<string, unknown> = { active: true };
    if (productId) {
      query.id = { $ne: productId };
    }

    if (category) {
      query.category = category;
    } else if (occasion) {
      query.occasions = occasion;
    }

    const items = await ProductModel.find(query).limit(limit).lean();

    const formatted = items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: Math.round(p.price / 100),
      compareAtPrice: p.compareAtPrice ? Math.round(p.compareAtPrice / 100) : undefined,
      personalizable: p.personalizable,
      badge: p.badge,
      subtitle: p.subtitle,
      artwork: p.artwork,
      color: p.color,
    }));

    return NextResponse.json({ recommendations: formatted });
  } catch (error) {
    return apiError(error);
  }
}
