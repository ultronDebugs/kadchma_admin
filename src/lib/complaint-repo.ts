import { getDb } from "@/lib/mongodb";

// Field names match what the n8n bot's "submit_complaint" tool already
// collects (same shape it used to send to the Google Sheets "Complains" tab).
export type StoredComplaint = {
  complaint_id: string;
  enrollment_id: string;
  full_name: string;
  phone_number: string;
  channel: string; // "WhatsApp" | "Instagram"
  complaint_category: string;
  complaint_details: string;
  status: string;
  submitted_at: string; // ISO 8601
  created_at: Date;
};

const COLLECTION = "complaints";
const PROJECT_OUT_ID = { projection: { _id: 0 } } as const;

async function collection() {
  const db = await getDb();
  return db.collection<StoredComplaint>(COLLECTION);
}

export async function ensureIndexes() {
  const col = await collection();
  await col.createIndex({ complaint_id: 1 }, { unique: true });
}

export async function listComplaints(): Promise<StoredComplaint[]> {
  const col = await collection();
  return col.find({}, PROJECT_OUT_ID).sort({ created_at: -1 }).toArray();
}

export async function insertComplaint(doc: Omit<StoredComplaint, "created_at">): Promise<void> {
  const col = await collection();
  await col.insertOne({ ...doc, created_at: new Date() });
}
