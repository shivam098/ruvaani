import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { CouponModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await rateLimit(`coupon-validate:${requestIp(request)}`, 30);
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0); // subtotal in paise

    if (!code) {
      return NextResponse.json({ error: "Please enter a coupon code." }, { status: 400 });
    }

    await connectDb();
    const user = await currentUser();

    const coupon = await CouponModel.findOne({ code, active: true }).lean();
    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired promo code." }, { status: 404 });
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return NextResponse.json({ error: "This promo code is not active yet." }, { status: 400 });
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
    }

    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon code has reached its maximum usage limit." }, { status: 400 });
    }

    if (subtotal < (coupon.minOrderValue || 0)) {
      const minRequiredRupees = Math.round((coupon.minOrderValue || 0) / 100);
      return NextResponse.json({
        error: `This coupon requires a minimum cart value of ₹${minRequiredRupees}.`,
      }, { status: 400 });
    }

    // Role check if applicable
    if (coupon.applicableRoles && coupon.applicableRoles.length > 0) {
      const userRole = user?.role || "CUSTOMER";
      if (!coupon.applicableRoles.includes(userRole)) {
        return NextResponse.json({
          error: "This coupon is exclusively available for corporate accounts.",
        }, { status: 403 });
      }
    }

    // Calculate discount in paise
    let discountPaise = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountPaise = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountPaise > coupon.maxDiscount) {
        discountPaise = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountPaise = coupon.discountValue;
    }

    // Discount cannot exceed subtotal
    discountPaise = Math.min(discountPaise, subtotal);

    const discountRupees = Math.round(discountPaise / 100);
    const finalTotalPaise = Math.max(0, subtotal - discountPaise);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description,
      discountPaise,
      discountRupees,
      finalTotalPaise,
      message: `Coupon '${coupon.code}' applied! You saved ₹${discountRupees}.`,
    });
  } catch (error) {
    return apiError(error);
  }
}
