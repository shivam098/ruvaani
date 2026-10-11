import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, HttpError, liveOnly, readBody, verifyOrigin } from "@/lib/http";
import { connectDb } from "@/lib/db";
import {
  AuditModel,
  OrderModel,
  ProductModel,
  QuoteModel,
  UserModel,
  CorporateAccountModel,
  MerchantModel,
} from "@/lib/models";
import type { ClientSession } from "mongoose";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("product"), id: z.string().regex(/^rv-\d{3}$/), stock: z.number().int().min(0).max(100000), active: z.boolean() }).strict(),
  z.object({ kind: z.literal("quote"), id: z.string().regex(/^[a-f0-9]{24}$/), status: z.enum(["SUBMITTED", "UNDER_REVIEW", "CONTACTED", "CLOSED"]) }).strict(),
  z.object({ kind: z.literal("order"), id: z.string().regex(/^[a-f0-9]{24}$/), status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED"]) }).strict(),
]);

export async function GET() {
  try {
    liveOnly();
    await requireUser(true);
    await connectDb();

    const [userCount, orderCount, quoteCount, productCount, corporateCount, merchantCount] = await Promise.all([
      UserModel.countDocuments(),
      OrderModel.countDocuments(),
      QuoteModel.countDocuments(),
      ProductModel.countDocuments(),
      CorporateAccountModel.countDocuments(),
      MerchantModel.countDocuments(),
    ]);

    return NextResponse.json({
      metrics: {
        users: userCount,
        orders: orderCount,
        quotes: quoteCount,
        products: productCount,
        corporateAccounts: corporateCount,
        merchants: merchantCount,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    verifyOrigin(request);
    liveOnly();
    const user = await requireUser(true);
    const data = await readBody(request, schema);
    const db = await connectDb();

    const executeUpdate = async (session?: ClientSession) => {
      let result;
      const opts = session ? { session } : {};
      if (data.kind === "product") {
        result = await ProductModel.updateOne({ id: data.id }, { $set: { stock: data.stock, active: data.active } }, opts);
      } else if (data.kind === "quote") {
        result = await QuoteModel.updateOne({ _id: data.id }, { $set: { status: data.status } }, opts);
      } else {
        const previous = ({ PROCESSING: "CONFIRMED", SHIPPED: "PROCESSING", DELIVERED: "SHIPPED" } as const)[data.status];
        result = await OrderModel.updateOne({ _id: data.id, paymentStatus: "PAID", status: previous }, { $set: { status: data.status } }, opts);
      }

      if (!result.matchedCount) {
        throw new HttpError(409, "Record not found or status transition is not allowed. Refresh and try again.");
      }

      if (session) {
        await AuditModel.create([{ userId: user.id, action: `${data.kind}.update`, target: data.id }], { session });
      } else {
        await AuditModel.create({ userId: user.id, action: `${data.kind}.update`, target: data.id });
      }
    };

    try {
      const session = await db.startSession();
      try {
        await session.withTransaction(async () => {
          await executeUpdate(session);
        });
      } finally {
        await session.endSession();
      }
    } catch (txError) {
      if (txError instanceof Error && (txError.message.includes("replica set") || txError.message.includes("Transaction numbers"))) {
        await executeUpdate();
      } else {
        throw txError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
