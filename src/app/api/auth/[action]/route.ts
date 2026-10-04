import { NextResponse } from "next/server";
import { apiError, HttpError, liveOnly, rateLimit, readBody, requestIp, verifyOrigin } from "@/lib/http";
import { createSession, currentUser, deleteSession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validation";
import { UserModel } from "@/lib/models";
import { hashPassword, verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function GET() {
  try { return NextResponse.json({ user: await currentUser() }, { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    verifyOrigin(request);
    liveOnly();
    const { action } = await context.params;
    if (action === "logout") {
      await deleteSession();
      return NextResponse.json({ success: true });
    }
    if (action !== "login" && action !== "register") throw new HttpError(404, "Unknown action.");
    await rateLimit(`auth-ip:${requestIp(request)}`, 30);
    const data = await readBody(request, action === "register" ? registerSchema : loginSchema);
    await rateLimit(`auth-email:${data.email}`, 10);
    let user;
    if (action === "register") {
      const registration = registerSchema.parse(data);
      if (await UserModel.exists({ email: registration.email })) throw new HttpError(400, "Unable to create this account. Try signing in instead.");
      try {
        user = await UserModel.create({ name: registration.name, email: registration.email, passwordHash: await hashPassword(registration.password), role: "CUSTOMER" });
      } catch (error) {
        if (error instanceof Error && "code" in error && error.code === 11000) throw new HttpError(400, "Unable to create this account. Try signing in instead.");
        throw error;
      }
    } else {
      user = await UserModel.findOne({ email: data.email }).select("+passwordHash");
      const valid = await verifyPassword(data.password, user?.passwordHash ?? `${"0".repeat(64)}:${"0".repeat(128)}`);
      if (!user || !valid) throw new HttpError(401, "Email or password is incorrect.");
    }
    await createSession(user._id.toString());
    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
  } catch (error) { return apiError(error); }
}
