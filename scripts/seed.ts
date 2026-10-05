import { connectDb } from "../src/lib/db";
import { ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel, HomepageModel } from "../src/lib/models";

async function main() {
  const db = await connectDb();
  try {
    for (const model of [ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel, HomepageModel]) {
      await model.createIndexes();
    }
    console.log("Database indexes created. Existing records were not changed.");
    console.log("The quote-only public catalogue is maintained in src/lib/catalog-data.ts; no sample prices or stock are seeded.");
  } finally { await db.disconnect(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
