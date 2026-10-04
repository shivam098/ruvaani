import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "./http";
import { OrderModel } from "./models";
import { connectDb } from "./db";

export function verifySignature(payload: string, signature: string, secret: string) {
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export async function razorpayRequest<T>(path: string, body?: object): Promise<T> {
  const { RAZORPAY_KEY_ID: key, RAZORPAY_KEY_SECRET: secret } = process.env;
  if (!key || !secret) throw new HttpError(503, "Payments are not configured yet. Please contact us.");
  if (!key.startsWith("rzp_test_")) throw new HttpError(503, "Live payments are not enabled in this MVP. Use Razorpay test keys until the production launch checklist is complete.");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok) throw new HttpError(502, "The payment provider is unavailable. Your payment has not been confirmed.");
  return response.json() as Promise<T>;
}

export interface ProviderPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function confirmCapturedPayment(paymentId: string, expectedOrderId?: string) {
  if (!/^pay_[a-zA-Z0-9]+$/.test(paymentId)) throw new HttpError(400, "Invalid payment reference.");
  const payment = await razorpayRequest<ProviderPayment>(`payments/${paymentId}`);
  if (expectedOrderId && payment.order_id !== expectedOrderId) throw new HttpError(400, "Payment does not match this order.");
  await connectDb();
  const order = await OrderModel.findOne({ razorpayOrderId: payment.order_id });
  if (!order) throw new HttpError(404, "Order not found. Contact support before paying again.");
  if (payment.amount !== order.total || payment.currency !== "INR") throw new HttpError(400, "Payment amount does not match the order.");
  if (payment.status !== "captured") throw new HttpError(409, "Your payment is awaiting capture. Check My orders shortly; do not pay again.");
  // Conditional update makes browser verification and repeated webhooks idempotent.
  await OrderModel.updateOne({ _id: order._id, paymentStatus: "PAYMENT_PENDING" }, {
    $set: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: payment.id },
  });
  return order.number;
}
