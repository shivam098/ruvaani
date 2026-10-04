import mongoose from "mongoose";

const globalDb = globalThis as typeof globalThis & { ruvaaniDb?: Promise<typeof mongoose> };

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MongoDB is not configured. Set MONGODB_URI before disabling demo mode.");
  if (!globalDb.ruvaaniDb) {
    globalDb.ruvaaniDb = mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "ruvaani",
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      autoIndex: false,
    }).catch((error: unknown) => {
      globalDb.ruvaaniDb = undefined;
      throw error;
    });
  }
  return globalDb.ruvaaniDb;
}
