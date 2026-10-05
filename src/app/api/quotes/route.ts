import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { apiError, liveOnly, rateLimit, readBody, requestIp, verifyOrigin } from "@/lib/http";
import { quoteSchema } from "@/lib/validation";
import { QuoteModel } from "@/lib/models";
import { catalogueProducts } from "@/lib/catalog-data";

export async function POST(request: Request) {
  try {
    verifyOrigin(request);
    liveOnly();
    await rateLimit(`quote:${requestIp(request)}`, 10);
    const { consent, ...data } = await readBody(request, quoteSchema);
    const reference = `RQ-${randomBytes(5).toString("hex").toUpperCase()}`;
    const product = catalogueProducts.find((product) => product.id === data.productId);
    await QuoteModel.create({ ...data, productName: product?.name, reference, consentAt: consent ? new Date() : undefined });
    return NextResponse.json({ reference }, { status: 201 });
  } catch (error) { return apiError(error); }
}
