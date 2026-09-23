import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "kadchma";

// Cached on `global` so dev-mode hot reload doesn't open a new connection
// pool on every module re-evaluation.
const globalForMongo = global as unknown as { mongoClientPromise?: Promise<MongoClient> };

export function isMongoConfigured() {
  return Boolean(uri);
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalForMongo.mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
