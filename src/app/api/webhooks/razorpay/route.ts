import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, HttpError, liveOnly } from "@/lib/http";
import { confirmCapturedPayment, verifySignature } from "@/lib/razorpay";

export const runtime = "nodejs";
const schema = z.object({
  event: z.string(),
  payload: z.object({ payment: z.object({ entity: z.object({ id: z.string().regex(/^pay_[a-zA-Z0-9]+$/) }) }).optional() }),
});

export async function POST(request: Request) {
  try {
    liveOnly();
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new HttpError(503, "Webhook is not configured.");
    if (Number(request.headers.get("content-length") || 0) > 65536) throw new HttpError(413, "Webhook is too large.");
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 65536) throw new HttpError(413, "Webhook is too large.");
    if (!verifySignature(raw, request.headers.get("x-razorpay-signature") ?? "", secret)) throw new HttpError(400, "Invalid webhook signature.");
    const data = schema.parse(JSON.parse(raw));
    if (data.event === "payment.captured") {
      if (!data.payload.payment) throw new HttpError(400, "Missing payment.");
      await confirmCapturedPayment(data.payload.payment.entity.id);
    }
    return NextResponse.json({ received: true });
  } catch (error) { return apiError(error); }
}
