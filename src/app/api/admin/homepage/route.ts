import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { apiError, HttpError, liveOnly, readBody, verifyOrigin } from "@/lib/http";
import { connectDb } from "@/lib/db";
import { AuditModel, HomepageModel } from "@/lib/models";
import { homepageUpdateSchema } from "@/lib/homepage-content";
import { getHomepageSettings } from "@/lib/homepage-settings";

export async function GET() {
  try {
    liveOnly();
    await requireUser(true);
    return NextResponse.json(await getHomepageSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

export async function PUT(request: Request) {
  try {
    verifyOrigin(request); liveOnly();
    const user = await requireUser(true);
    const { revision, content } = await readBody(request, homepageUpdateSchema);
    const db = await connectDb();
    const session = await db.startSession();
    try {
      await session.withTransaction(async () => {
        const result = await HomepageModel.findOneAndUpdate(
          { _id: "homepage", revision },
          { $set: { content, revision: revision + 1 } },
          { upsert: revision === 0, new: true, runValidators: true, session },
        );
        if (!result) throw new HttpError(409, "The homepage was changed by another administrator. Reload the editor before publishing.");
        await AuditModel.create([{ userId: user.id, action: "homepage.update", target: "homepage" }], { session });
      });
    } finally { await session.endSession(); }
    revalidatePath("/", "layout");
    return NextResponse.json({ revision: revision + 1, content }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return apiError(new HttpError(409, "The homepage was changed by another administrator. Reload the editor before publishing."));
    }
    return apiError(error);
  }
}
