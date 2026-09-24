import { getDb } from "@/lib/mongodb";

export type StoredUser = {
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  scope: string;
  account: "Active" | "Suspended";
  createdAt: Date;
  lastActiveAt: Date | null;
};

export type PublicUser = Omit<StoredUser, "passwordHash">;

function toPublicUser(doc: StoredUser): PublicUser {
  return {
    email: doc.email,
    name: doc.name,
    role: doc.role,
    scope: doc.scope,
    account: doc.account,
    createdAt: doc.createdAt,
    lastActiveAt: doc.lastActiveAt,
  };
}

const COLLECTION = "staff_users";

async function collection() {
  const db = await getDb();
  return db.collection<StoredUser>(COLLECTION);
}

export async function ensureUserIndexes() {
  const col = await collection();
  await col.createIndex({ email: 1 }, { unique: true });
}

export async function countUsers(): Promise<number> {
  const col = await collection();
  return col.countDocuments();
}

/** Includes passwordHash — for login verification only, never return this over the API. */
export async function findUserWithHashByEmail(email: string): Promise<StoredUser | null> {
  const col = await collection();
  return col.findOne({ email: email.toLowerCase() });
}

export async function listUsersSafe(): Promise<PublicUser[]> {
  const col = await collection();
  const docs = await col.find({}).sort({ createdAt: 1 }).toArray();
  return docs.map(toPublicUser);
}

export async function insertUser(doc: Omit<StoredUser, "createdAt" | "lastActiveAt">): Promise<void> {
  const col = await collection();
  await col.insertOne({ ...doc, email: doc.email.toLowerCase(), createdAt: new Date(), lastActiveAt: null });
}

export async function updateUserByEmail(
  email: string,
  patch: Partial<Pick<StoredUser, "role" | "scope" | "account">>,
): Promise<PublicUser | null> {
  const col = await collection();
  const updated = await col.findOneAndUpdate({ email: email.toLowerCase() }, { $set: patch }, { returnDocument: "after" });
  return updated ? toPublicUser(updated) : null;
}

export async function touchLastActive(email: string): Promise<void> {
  const col = await collection();
  await col.updateOne({ email: email.toLowerCase() }, { $set: { lastActiveAt: new Date() } });
}
