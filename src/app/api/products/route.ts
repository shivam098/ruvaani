import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/lib/models";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category");
    const occasion = searchParams.get("occasion");
    const recipient = searchParams.get("recipient");
    const maxPrice = searchParams.get("maxPrice");
    const personalizable = searchParams.get("personalizable");
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));

    await connectDb();

    const filter: Record<string, unknown> = { active: true };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { subtitle: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { occasions: { $elemMatch: { $regex: query, $options: "i" } } },
        { includes: { $elemMatch: { $regex: query, $options: "i" } } },
      ];
    }

    if (category && category !== "All gifts") {
      filter.category = category;
    }

    if (occasion) {
      filter.occasions = occasion;
    }

    if (recipient) {
      filter.recipients = recipient;
    }

    if (maxPrice) {
      const maxPaise = parseInt(maxPrice, 10) * 100;
      if (!isNaN(maxPaise)) {
        filter.price = { $lte: maxPaise };
      }
    }

    if (personalizable === "true") {
      filter.personalizable = true;
    }

    let sortOption: Record<string, 1 | -1> = { featured: -1, createdAt: -1 };
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const total = await ProductModel.countDocuments(filter);
    const products = await ProductModel.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
