import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ProductModel, MerchantModel } from "@/lib/models";
import { apiError } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    await connectDb();

    const merchant = await MerchantModel.findOne({
      $or: [{ userId: user.id }, { email: user.email.toLowerCase() }],
    });

    if (!merchant && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ products: [] });
    }

    const query = merchant ? { merchantId: merchant._id } : {};
    const products = await ProductModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ products });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    await connectDb();

    let merchant = await MerchantModel.findOne({
      $or: [{ userId: user.id }, { email: user.email.toLowerCase() }],
    });

    if (!merchant && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      merchant = await MerchantModel.findOne();
    }

    const {
      name,
      description,
      subtitle,
      category,
      price,
      compareAtPrice,
      stock,
      moq,
      personalizable,
      images,
      occasions,
      recipients,
      tags,
    } = body;

    if (!name || !price) {
      return NextResponse.json({ error: "Product name and price are required." }, { status: 400 });
    }

    const id = `rv-m${randomBytes(3).toString("hex")}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const priceInPaise = Math.round(Number(price) * 100);
    const compareAtPaise = compareAtPrice ? Math.round(Number(compareAtPrice) * 100) : Math.round(priceInPaise * 1.2);

    const product = await ProductModel.create({
      id,
      slug: `${slug}-${randomBytes(2).toString("hex")}`,
      name,
      subtitle: subtitle || "Premium Curated Gifting",
      description: description || name,
      category: category || "Hampers",
      price: priceInPaise,
      compareAtPrice: compareAtPaise,
      stock: Number(stock) || 50,
      minimumOrderQuantity: Number(moq) || 1,
      personalizable: Boolean(personalizable),
      artwork: "hamper",
      color: "#ede5da",
      occasions: Array.isArray(occasions) ? occasions : ["Corporate events", "Diwali"],
      recipients: Array.isArray(recipients) ? recipients : ["Clients", "Employees"],
      includes: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : [],
      merchantId: merchant?._id,
      featured: false,
      active: true,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
