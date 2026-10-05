"use client";

import { apiRequest } from "./client-api";

interface PaymentResult { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
export interface PaymentOrder { orderId: string; amount: number; keyId: string; number: string }
export interface PaymentPrefill { name: string; email: string; contact: string }
interface CheckoutOptions {
  key: string; amount: number; currency: string; name: string; order_id: string;
  description: string; prefill: PaymentPrefill; theme: { color: string };
  handler: (response: PaymentResult) => void; modal: { ondismiss: () => void };
}
declare global { interface Window { Razorpay?: new (options: CheckoutOptions) => { open: () => void; on: (event: string, callback: () => void) => void } } }

export async function loadRazorpay() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error("The payment window could not load. Please try again.")); };
    document.head.appendChild(script);
  });
}

export async function completePayment(order: PaymentOrder, prefill: PaymentPrefill): Promise<string> {
  await loadRazorpay();
  if (!window.Razorpay) throw new Error("The payment window is not available.");
  const Razorpay = window.Razorpay;
  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: order.keyId, amount: order.amount, currency: "INR", name: "RUVAANI",
      order_id: order.orderId, description: `Your thoughtful gifts · ${order.number}`,
      prefill, theme: { color: "#064c3c" },
      handler: async (response) => {
        try {
          const confirmation = await apiRequest<{ number: string }>("/api/payments/verify", response);
          resolve(confirmation.number);
        } catch (error) { reject(error); }
      },
      modal: { ondismiss: () => reject(new Error("Payment was not completed. Resume this order from My orders; do not create another checkout.")) },
    });
    // A failed attempt is not terminal: Razorpay lets the user retry inside the same modal.
    instance.open();
  });
}
