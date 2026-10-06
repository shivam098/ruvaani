import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAnalyticsSummary } from "@/lib/analytics";
import { apiError, liveOnly } from "@/lib/http";
export async function GET() {
  try {
    liveOnly();
    await requireUser(true);
    return NextResponse.json(await getAnalyticsSummary(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
