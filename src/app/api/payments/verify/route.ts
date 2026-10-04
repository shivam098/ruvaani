import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, HttpError, liveOnly, readBody, verifyOrigin } from "@/lib/http";
import { connectDb } from "@/lib/db";
import { OrderModel } from "@/lib/models";
import { confirmCapturedPayment, verifySignature } from "@/lib/razorpay";

const schema = z.object({
  razorpay_order_id: z.string().regex(/^order_[a-zA-Z0-9]+$/),
  razorpay_payment_id: z.string().regex(/^pay_[a-zA-Z0-9]+$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export async function POST(request: Request) {
  try {
    verifyOrigin(request); liveOnly();
    const user = await requireUser();
    const data = await readBody(request, schema);
    await connectDb();
    const order = await OrderModel.findOne({ razorpayOrderId: data.razorpay_order_id, userId: user.id });
    if (!order) throw new HttpError(404, "Order not found.");
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new HttpError(503, "Payments are not configured.");
    if (!verifySignature(`${order.razorpayOrderId}|${data.razorpay_payment_id}`, data.razorpay_signature, secret)) throw new HttpError(400, "Payment signature is invalid.");
    const number = await confirmCapturedPayment(data.razorpay_payment_id, order.razorpayOrderId);
    return NextResponse.json({ number });
  } catch (error) { return apiError(error); }
}
