import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { isDemoMode } from "./config";
import { connectDb } from "./db";
import { SessionModel, UserModel } from "./models";
import { HttpError } from "./http";
import type { UserView } from "./types";

const COOKIE = "ruvaani_session";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function currentUser(): Promise<UserView | null> {
  if (isDemoMode()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  await connectDb();
  const session = await SessionModel.findOne({ tokenHash: digest(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const user = await UserModel.findById(session.userId).lean();
  return user ? { id: user._id.toString(), name: user.name, email: user.email, role: user.role } : null;
}

export async function requireUser(admin = false) {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  if (admin && user.role !== "ADMIN") throw new HttpError(403, "Administrator access is required.");
  return user;
}

export async function createSession(userId: string) {
  await deleteSession();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 86400000);
  await SessionModel.create({ tokenHash: digest(token), userId, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", expires: expiresAt,
  });
}

export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await connectDb();
    await SessionModel.deleteOne({ tokenHash: digest(token) });
  }
  jar.delete(COOKIE);
}
