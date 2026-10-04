import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError, HttpError, liveOnly, rateLimit, verifyOrigin } from "@/lib/http";
import { OrderModel } from "@/lib/models";
import { confirmCapturedPayment, razorpayRequest, type ProviderPayment } from "@/lib/razorpay";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    verifyOrigin(request); liveOnly();
    const user = await requireUser();
    await rateLimit(`resume:${user.id}`, 20);
    const { id } = await context.params;
    if (!/^[a-f0-9]{24}$/.test(id)) throw new HttpError(400, "Invalid order reference.");
    const order = await OrderModel.findOne({ _id: id, userId: user.id });
    if (!order) throw new HttpError(404, "Order not found.");
    if (order.paymentStatus === "PAID") return NextResponse.json({ paid: true });
    const payments = await razorpayRequest<{ items: ProviderPayment[] }>(`orders/${order.razorpayOrderId}/payments`);
    const captured = payments.items.find((p) => p.status === "captured");
    if (captured) {
      await confirmCapturedPayment(captured.id, order.razorpayOrderId);
      return NextResponse.json({ paid: true });
    }
    if (payments.items.some((p) => p.status === "authorized")) {
      throw new HttpError(409, "A payment is awaiting capture. Check again shortly; do not pay a second time.");
    }
    return NextResponse.json({
      paid: false, orderId: order.razorpayOrderId, amount: order.total,
      keyId: process.env.RAZORPAY_KEY_ID, number: order.number,
      prefill: { name: order.address?.name ?? "", email: order.address?.email ?? "", contact: order.address?.phone ?? "" },
    });
  } catch (error) { return apiError(error); }
}
