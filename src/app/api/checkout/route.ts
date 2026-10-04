import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { ProductModel, OrderModel } from "@/lib/models";
import { checkoutSchema } from "@/lib/validation";
import { calculateCart } from "@/lib/commerce";
import { apiError, HttpError, liveOnly, rateLimit, readBody, verifyOrigin } from "@/lib/http";
import { razorpayRequest } from "@/lib/razorpay";
import type { Product } from "@/lib/types";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    verifyOrigin(request);
    liveOnly();
    const user = await requireUser();
    await rateLimit(`checkout:${user.id}`, 15);
    const data = await readBody(request, checkoutSchema);
    const requestHash = createHash("sha256").update(JSON.stringify({ items: data.items, address: data.address })).digest("hex");
    const existing = await OrderModel.findOne({ idempotencyKey: data.idempotencyKey });
    if (existing) {
      if (existing.userId !== user.id || existing.requestHash !== requestHash) throw new HttpError(409, "Checkout has changed. Refresh and try again.");
      if (existing.paymentStatus === "PAID") throw new HttpError(409, "This order is already paid. Check My orders.");
      return NextResponse.json({ orderId: existing.razorpayOrderId, amount: existing.total, keyId: process.env.RAZORPAY_KEY_ID, number: existing.number });
    }
    const products = await ProductModel.find({ id: { $in: data.items.map((item) => item.productId) }, active: true }).lean() as Product[];
    let calculated;
    try { calculated = calculateCart(data.items, products); }
    catch (error) { throw new HttpError(400, error instanceof Error ? error.message : "Please review your bag."); }
    const number = `RV-${randomBytes(6).toString("hex").toUpperCase()}`;
    const providerOrder = await razorpayRequest<{ id: string }>("orders", { amount: calculated.total, currency: "INR", receipt: number });
    const db = await connectDb();
    const session = await db.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of calculated.items) {
          const expectedProduct = products.find((p) => p.id === item.productId)!;
          const reserved = await ProductModel.updateOne({
            id: item.productId, active: true, price: expectedProduct.price,
            stock: { $gte: item.quantity },
          }, { $inc: { stock: -item.quantity } }, { session });
          if (reserved.modifiedCount !== 1) throw new HttpError(409, "A gift's availability or price changed. Please refresh your bag.");
        }
        await OrderModel.create([{
          ...calculated, number, userId: user.id, idempotencyKey: data.idempotencyKey,
          requestHash, razorpayOrderId: providerOrder.id, address: data.address,
        }], { session });
      });
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === 11000) {
        throw new HttpError(409, "Checkout is already being created. Retry once to resume the same order.");
      }
      throw error;
    } finally { await session.endSession(); }
    return NextResponse.json({ orderId: providerOrder.id, amount: calculated.total, keyId: process.env.RAZORPAY_KEY_ID, number });
  } catch (error) { return apiError(error); }
}
