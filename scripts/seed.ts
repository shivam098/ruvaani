import { connectDb } from "../src/lib/db";
import { ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel } from "../src/lib/models";
import { demoProducts } from "../src/lib/catalog-data";

async function main() {
  const db = await connectDb();
  try {
    for (const model of [ProductModel, UserModel, SessionModel, OrderModel, QuoteModel, RateModel, AuditModel]) {
      await model.createIndexes();
    }
    for (const product of demoProducts) {
      await ProductModel.updateOne({ id: product.id }, { $setOnInsert: product }, { upsert: true });
    }
    console.log("Indexes created. Eight illustrative products inserted only if absent; existing stock and content were not overwritten.");
    console.log("Replace sample products and commercial terms before enabling live payments.");
  } finally { await db.disconnect(); }
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
