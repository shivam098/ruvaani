import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { apiError, HttpError, liveOnly, readBody, verifyOrigin } from "@/lib/http";
import { connectDb } from "@/lib/db";
import { AuditModel, OrderModel, ProductModel, QuoteModel } from "@/lib/models";

const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("product"), id: z.string().regex(/^rv-\d{3}$/), stock: z.number().int().min(0).max(100000), active: z.boolean() }).strict(),
  z.object({ kind: z.literal("quote"), id: z.string().regex(/^[a-f0-9]{24}$/), status: z.enum(["SUBMITTED", "UNDER_REVIEW", "CONTACTED", "CLOSED"]) }).strict(),
  z.object({ kind: z.literal("order"), id: z.string().regex(/^[a-f0-9]{24}$/), status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED"]) }).strict(),
]);

export async function PATCH(request: Request) {
  try {
    verifyOrigin(request); liveOnly();
    const user = await requireUser(true);
    const data = await readBody(request, schema);
    const db = await connectDb();
    const session = await db.startSession();
    try {
      await session.withTransaction(async () => {
        let result;
        if (data.kind === "product") result = await ProductModel.updateOne({ id: data.id }, { $set: { stock: data.stock, active: data.active } }, { session });
        else if (data.kind === "quote") result = await QuoteModel.updateOne({ _id: data.id }, { $set: { status: data.status } }, { session });
        else {
          const previous = ({ PROCESSING: "CONFIRMED", SHIPPED: "PROCESSING", DELIVERED: "SHIPPED" } as const)[data.status];
          result = await OrderModel.updateOne({ _id: data.id, paymentStatus: "PAID", status: previous }, { $set: { status: data.status } }, { session });
        }
        if (!result.matchedCount) throw new HttpError(409, "Record not found or status transition is not allowed. Refresh and try again.");
        await AuditModel.create([{ userId: user.id, action: `${data.kind}.update`, target: data.id }], { session });
      });
    } finally { await session.endSession(); }
    return NextResponse.json({ success: true });
  } catch (error) { return apiError(error); }
}
