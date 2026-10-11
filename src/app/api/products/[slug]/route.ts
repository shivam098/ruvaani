import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ProductModel } from "@/lib/models";
import { apiError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    await connectDb();

    const product = await ProductModel.findOne({
      $or: [{ slug }, { id: slug }],
      active: true,
    }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return apiError(error);
  }
}
