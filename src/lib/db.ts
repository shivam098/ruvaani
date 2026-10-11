import mongoose from "mongoose";

const globalDb = globalThis as typeof globalThis & { ruvaaniDb?: Promise<typeof mongoose> };

function normalizeMongoUri(rawUri: string): string {
  const match = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.*)@([^@/]+)(\/?.*)$/);
  if (match) {
    const [, protocol, username, password, host, rest] = match;
    const encodedUser = encodeURIComponent(decodeURIComponent(username));
    const encodedPass = encodeURIComponent(decodeURIComponent(password));
    return `${protocol}${encodedUser}:${encodedPass}@${host}${rest}`;
  }
  return rawUri;
}

export async function connectDb() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) throw new Error("MongoDB is not configured. Set MONGODB_URI before disabling demo mode.");

  const uri = normalizeMongoUri(rawUri);

  if (!globalDb.ruvaaniDb) {
    globalDb.ruvaaniDb = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "ruvaani",
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 15000,
      autoIndex: false,
    }).catch((error: unknown) => {
      globalDb.ruvaaniDb = undefined;
      throw error;
    });
  }
  return globalDb.ruvaaniDb;
}
