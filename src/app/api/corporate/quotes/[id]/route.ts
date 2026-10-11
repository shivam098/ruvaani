import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { QuoteModel, OrderModel } from "@/lib/models";
import { apiError } from "@/lib/http";
import { requireUser, currentUser } from "@/lib/auth";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectDb();
    const user = await currentUser();

    const quote = await QuoteModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { reference: id }],
    }).lean();

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" && quote.email !== user?.email) {
      return NextResponse.json({ error: "Unauthorized access to this quote." }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectDb();
    const user = await requireUser();

    const quote = await QuoteModel.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { reference: id }],
    });

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    // Admin updates: pricing calculation, status, notes
    if (isAdmin) {
      if (body.customizationCost !== undefined) quote.customizationCost = body.customizationCost;
      if (body.shippingCost !== undefined) quote.shippingCost = body.shippingCost;
      if (body.tax !== undefined) quote.tax = body.tax;
      if (body.corporateDiscount !== undefined) quote.corporateDiscount = body.corporateDiscount;
      if (body.totalQuoteAmount !== undefined) quote.totalQuoteAmount = body.totalQuoteAmount;
      if (body.adminNotes !== undefined) quote.adminNotes = body.adminNotes;
      if (body.status && ["UNDER_REVIEW", "QUOTE_SENT", "NEGOTIATION", "REJECTED", "EXPIRED"].includes(body.status)) {
        quote.status = body.status;
      }
    }

    // Corporate buyer actions: APPROVE, REJECT
    if (body.action === "APPROVE" && (quote.email === user.email || isAdmin)) {
      quote.status = "APPROVED";
    } else if (body.action === "REJECT" && (quote.email === user.email || isAdmin)) {
      quote.status = "REJECTED";
    }

    // Convert approved quote to bulk order
    if (body.action === "CONVERT_TO_ORDER" && quote.status === "APPROVED") {
      const orderNumber = `CRV-${randomBytes(4).toString("hex").toUpperCase()}`;
      const qty = quote.quantity ?? 25;
      const budgetPerUnit = (quote.budget ?? 1000) * 100;
      const calculatedTotal = quote.totalQuoteAmount || (budgetPerUnit * qty);

      const newOrder = new OrderModel({
        number: orderNumber,
        userId: user.id,
        idempotencyKey: `quote-convert-${quote.reference}-${Date.now()}`,
        requestHash: `quote-${quote.reference}`,
        razorpayOrderId: `rzp_quote_${randomBytes(6).toString("hex")}`,
        items: quote.items && quote.items.length > 0 ? quote.items : [{
          productId: quote.productId || "corporate-custom",
          name: quote.productName || "Corporate Bulk Hamper Selection",
          quantity: qty,
          unitPrice: Math.round(calculatedTotal / qty),
          personalization: { name: quote.company || "", message: quote.requirements || "" },
        }],
        subtotal: calculatedTotal,
        discount: quote.corporateDiscount || 0,
        shipping: quote.shippingCost || 0,
        tax: quote.tax || 0,
        total: calculatedTotal,
        paymentStatus: "PAYMENT_PENDING",
        status: "CONFIRMED",
        corporateOrder: true,
        quoteId: quote.reference,
      });

      await newOrder.save();

      quote.status = "CONVERTED_TO_ORDER";
      quote.convertedOrderId = orderNumber;
      await quote.save();

      return NextResponse.json({
        success: true,
        quote,
        orderNumber,
        message: "Quote successfully converted to bulk order.",
      });
    }

    await quote.save();
    return NextResponse.json({ success: true, quote });
  } catch (error) {
    return apiError(error);
  }
}
