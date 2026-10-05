import { apiError, HttpError, verifyOrigin } from "@/lib/http";

export async function POST(request: Request) {
  try {
    verifyOrigin(request);
    throw new HttpError(410, "This catalogue is quote-only. Please request a quotation; direct checkout is not available.");
  } catch (error) { return apiError(error); }
}
