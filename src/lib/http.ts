import { createHash } from "node:crypto";
import { ZodError, type ZodType } from "zod";
import { NextResponse } from "next/server";
import { isDemoMode, siteUrl } from "./config";
import { connectDb } from "./db";
import { RateModel } from "./models";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function liveOnly() {
  if (isDemoMode()) throw new HttpError(503, "Demo mode: no real accounts, payments or enquiries are accepted.");
}

export function verifyOrigin(request: Request) {
  const origins = new Set([new URL(siteUrl()).origin, new URL(request.url).origin]);
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (!origins.has(request.headers.get("origin") ?? "")) throw new HttpError(403, "Request origin is not allowed.");
}

export async function readBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Send JSON content.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "A request body is required.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 32_768) { await reader.cancel(); throw new HttpError(413, "Request is too large."); }
    chunks.push(value);
  }
  let data: unknown;
  try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new HttpError(400, "Request contains invalid JSON."); }
  return schema.parse(data);
}

export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
  const incident = crypto.randomUUID();
  console.error("RUVAANI request failed", { incident, error: error instanceof Error ? error.name : "UnknownError" });
  return NextResponse.json({ error: `We could not complete this request. Please try again. Reference: ${incident}` }, { status: 500 });
}

export async function rateLimit(key: string, maximum: number, windowSeconds = 900) {
  await connectDb();
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  const id = createHash("sha256").update(`${key}:${window}`).digest("hex");
  const bucket = await RateModel.findOneAndUpdate({ _id: id }, {
    $inc: { count: 1 },
    $setOnInsert: { expiresAt: new Date((window + 2) * windowSeconds * 1000) },
  }, { upsert: true, new: true });
  if (bucket.count > maximum) throw new HttpError(429, "Too many attempts. Please try again in 15 minutes.");
}

export function requestIp(request: Request) {
  // Vercel overwrites this header. Do not trust arbitrary forwarded headers off-platform.
  return process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") ?? "unknown" : "local";
}
