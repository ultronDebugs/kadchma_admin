import { getDb } from "@/lib/mongodb";
import type { AuditAction, Status } from "@/lib/types";

export type StoredAuditEntry = {
  at: Date;
  admin: string;
  action: AuditAction;
  enrollee: string;
  enrollmentId: string;
  from: Status | null;
  to: Status | null;
};

const COLLECTION = "audit_log";
const PROJECT_OUT_ID = { projection: { _id: 0 } } as const;

async function collection() {
  const db = await getDb();
  return db.collection<StoredAuditEntry>(COLLECTION);
}

export async function listAudit(): Promise<StoredAuditEntry[]> {
  const col = await collection();
  return col.find({}, PROJECT_OUT_ID).sort({ at: -1 }).toArray();
}

export async function insertAudit(entry: StoredAuditEntry): Promise<void> {
  const col = await collection();
  await col.insertOne(entry);
}
