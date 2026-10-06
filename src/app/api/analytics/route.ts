import { NextResponse } from "next/server";
import { isAnalyticsEnabled } from "@/lib/config";
import { interactionSchema } from "@/lib/interaction-data";
import { recordInteraction } from "@/lib/analytics";
import { apiError, HttpError, readBody, rateLimit, requestIp, verifyOrigin } from "@/lib/http";

export async function POST(request: Request) {
  try {
    verifyOrigin(request);
    if (!isAnalyticsEnabled()) throw new HttpError(503, "Interaction analytics are disabled.");
    if (request.headers.get("dnt") === "1" || request.headers.get("sec-gpc") === "1") return new NextResponse(null, { status: 204 });
    const interaction = await readBody(request, interactionSchema);
    await rateLimit(`analytics:${requestIp(request)}`, 120);
    await recordInteraction(interaction);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return apiError(error); }
}
