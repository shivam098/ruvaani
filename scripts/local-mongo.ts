import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const dbPath = resolve(process.cwd(), ".mongodb_data");
  mkdirSync(dbPath, { recursive: true });

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: "ruvaani",
      dbPath,
      storageEngine: "wiredTiger",
    },
  });

  console.log(`\n======================================================`);
  console.log(`🍃 Local MongoDB server is UP and RUNNING!`);
  console.log(`   Connection URI: mongodb://127.0.0.1:27017/`);
  console.log(`   Database name:  ruvaani`);
  console.log(`   Data directory: ${dbPath}`);
  console.log(`======================================================`);
  console.log(`You can now run in a separate terminal:`);
  console.log(`  npm.cmd run db:seed`);
  console.log(`  npm.cmd run dev`);
  console.log(`\nPress Ctrl+C to stop the database.\n`);

  const cleanup = async () => {
    console.log("\nStopping local MongoDB server...");
    await mongod.stop();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

main().catch((err) => {
  console.error("Failed to start local MongoDB:", err);
  process.exit(1);
});
