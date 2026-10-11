import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { connectDb } from "@/lib/db";
import { QuoteModel, CorporateAccountModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await rateLimit(`corporate-quote:${requestIp(request)}`, 15);
    const body = await request.json();

    const {
      name,
      company,
      email,
      phone,
      designation,
      occasion,
      quantity,
      budgetPerGift,
      totalBudget,
      expectedDeliveryDate,
      locations,
      personalization,
      companyLogo,
      requirements,
      items,
    } = body;

    if (!name || !company || !email || !phone) {
      return NextResponse.json({ error: "Name, company, email, and phone number are required." }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(String(phone).replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }

    const qty = parseInt(quantity || "25", 10);
    if (isNaN(qty) || qty < 10) {
      return NextResponse.json({ error: "Corporate gifting requires a minimum order of 10 gifts." }, { status: 400 });
    }

    await connectDb();
    const user = await currentUser();

    const reference = `CRQ-${randomBytes(4).toString("hex").toUpperCase()}`;

    // Auto-link or create corporate account profile
    let corporateAccount = await CorporateAccountModel.findOne({ workEmail: email.toLowerCase() });
    if (!corporateAccount) {
      corporateAccount = await CorporateAccountModel.create({
        companyName: company,
        workEmail: email.toLowerCase(),
        mobile: phone,
        designation,
        status: "PENDING",
        userId: user?.id,
      });
    }

    const quote = await QuoteModel.create({
      reference,
      name,
      company,
      email: email.toLowerCase(),
      phone,
      occasion: occasion || "Corporate Gifting",
      quantity: qty,
      budget: budgetPerGift || (totalBudget ? Math.round(totalBudget / qty) : 1000),
      deliveryDate: expectedDeliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      locations: locations || "Multiple corporate offices",
      personalization: Boolean(personalization),
      companyLogo,
      requirements: requirements || "",
      items: Array.isArray(items) ? items : [],
      consentAt: new Date(),
      status: "SUBMITTED",
    });

    return NextResponse.json({
      success: true,
      reference: quote.reference,
      message: "Your corporate quote request has been received. Our gifting specialist will contact you within 24 hours.",
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: Request) {
  try {
    await connectDb();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to view quotes." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    // Normal customer or corporate only sees their own quotes; admin sees all
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      query.email = user.email.toLowerCase();
    }

    const quotes = await QuoteModel.find(query).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ quotes });
  } catch (error) {
    return apiError(error);
  }
}
