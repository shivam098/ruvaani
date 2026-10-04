import { connectDb } from "../src/lib/db";
import { UserModel } from "../src/lib/models";
import { hashPassword } from "../src/lib/password";
import { registerSchema } from "../src/lib/validation";

async function main() {
  const data = registerSchema.parse({ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME, password: process.env.ADMIN_PASSWORD });
  const db = await connectDb();
  try {
    await UserModel.createIndexes();
    if (await UserModel.exists({ email: data.email })) throw new Error("An account with that email already exists; no privileges changed.");
    await UserModel.create({ email: data.email, name: data.name, passwordHash: await hashPassword(data.password), role: "ADMIN" });
    console.log("Administrator created. Remove ADMIN_PASSWORD from .env.local now.");
  } finally { await db.disconnect(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
