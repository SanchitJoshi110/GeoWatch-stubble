// Local development MongoDB (single-node replica set, as Prisma requires). Data persists in .data/.
import { MongoMemoryReplSet } from "mongodb-memory-server";

const DEV_DB_PORT = 27018;

const replicaSet = await MongoMemoryReplSet.create({
  replSet: { count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ port: DEV_DB_PORT, dbPath: ".data" }],
});
console.log(`Dev MongoDB ready: ${replicaSet.getUri("stubble")}`);

process.on("SIGINT", async () => {
  await replicaSet.stop();
  process.exit(0);
});
