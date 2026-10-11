import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { ReviewModel, ProductModel, OrderModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId parameter is required." }, { status: 400 });
    }

    await connectDb();

    const reviews = await ReviewModel.find({ productId, status: "APPROVED" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = reviews.length;
    const avgRating = total > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 5.0;

    return NextResponse.json({
      productId,
      totalReviews: total,
      averageRating: avgRating,
      reviews,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await rateLimit(`review-submit:${requestIp(request)}`, 10);
    const body = await request.json();
    const { productId, rating, title, comment, name } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Product, rating (1-5), and review text are required." }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    await connectDb();
    const user = await currentUser();

    // Check if user has purchased this product
    let verified = false;
    if (user?.id) {
      const hasPurchased = await OrderModel.exists({
        userId: user.id,
        paymentStatus: "PAID",
        "items.productId": productId,
      });
      verified = Boolean(hasPurchased);
    }

    const review = await ReviewModel.create({
      productId,
      userId: user?.id || "guest",
      userName: name || user?.name || "Verified Customer",
      rating: ratingNum,
      title: title || "",
      comment: String(comment).trim(),
      verifiedPurchase: verified,
      status: "APPROVED",
    });

    // Update product rating and reviewsCount in MongoDB
    try {
      const allProductReviews = await ReviewModel.find({ productId, status: "APPROVED" });
      const newAvg = Number((allProductReviews.reduce((sum, r) => sum + r.rating, 0) / allProductReviews.length).toFixed(1));
      await ProductModel.updateOne(
        { id: productId },
        { $set: { rating: newAvg, reviewsCount: allProductReviews.length } }
      );
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      review,
      message: "Thank you! Your review has been published.",
    }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
