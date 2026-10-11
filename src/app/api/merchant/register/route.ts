import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { MerchantModel, MerchantKycModel, UserModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await rateLimit(`merchant-reg:${requestIp(request)}`, 10);
    const body = await request.json();

    const {
      businessName,
      brandName,
      email,
      mobile,
      category,
      pan,
      gstin,
      bankDetails,
    } = body;

    if (!businessName || !brandName || !email || !mobile) {
      return NextResponse.json({ error: "Business name, brand name, email, and phone number are required." }, { status: 400 });
    }

    if (!/^[6-9]\d{9}$/.test(String(mobile).replace(/\D/g, ""))) {
      return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }

    await connectDb();
    const user = await currentUser();

    const existing = await MerchantModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "A merchant account with this email is already registered." }, { status: 400 });
    }

    const merchant = await MerchantModel.create({
      businessName,
      brandName,
      email: email.toLowerCase(),
      mobile,
      category: category || "Hampers & Gifting",
      status: "PENDING_APPROVAL",
      commissionRate: 15,
      userId: user?.id,
    });

    if (pan || gstin || bankDetails) {
      await MerchantKycModel.create({
        merchantId: merchant._id,
        pan,
        gstin,
        bankDetails: bankDetails || {},
        status: "PENDING",
      });
    }

    // If logged in, elevate user role to MERCHANT
    if (user?.id) {
      await UserModel.findByIdAndUpdate(user.id, { role: "MERCHANT" });
    }

    return NextResponse.json({
      success: true,
      merchantId: merchant._id.toString(),
      message: "Merchant registration submitted successfully. Ruvaani onboarding team will review your application within 1 business day.",
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
