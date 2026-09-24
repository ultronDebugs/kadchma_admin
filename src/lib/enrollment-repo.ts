import { getDb } from "@/lib/mongodb";

// Field names match what the n8n WhatsApp bot already collects (same shape
// its "save_enrollment" tool call used to send to Google Sheets), so the
// bot side only needs its HTTP target swapped, not its data.
export type StoredEnrollment = {
  enrollment_id: string;
  first_name: string;
  last_name: string;
  other_name: string;
  phone_number: string;
  date_of_birth: string; // DD/MM/YYYY
  gender: "Male" | "Female";
  address: string;
  plan_type: "Individual" | "Family";
  facility_of_choice: string;
  NIN: string;
  email: string;
  payment_reference: string;
  payment_status: string;
  payment_proof_note: string;
  status: string;
  enrolled_at: string; // ISO 8601
  contact_channel: string; // "WhatsApp" | "Instagram"
  contact_id: string; // platform sender id, for resending messages and matching a staged photo
  has_photo: boolean;
  photo_mime_type: string;
  photo_base64: string; // kept out of list/lookup projections — fetched only via findPhoto
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  created_at: Date;
};

const COLLECTION = "enrollments";
// Photo data is potentially hundreds of KB — never load it for a list or
// a lookup that only needs the record's other fields.
const PROJECT_OUT_PHOTO = { projection: { _id: 0, photo_base64: 0 } } as const;
const PROJECT_ONLY_PHOTO = { projection: { _id: 0, photo_base64: 1, photo_mime_type: 1 } } as const;

async function collection() {
  const db = await getDb();
  return db.collection<StoredEnrollment>(COLLECTION);
}

export async function ensureIndexes() {
  const col = await collection();
  await col.createIndex({ enrollment_id: 1 }, { unique: true });
  await col.createIndex({ NIN: 1 });
}

export async function listEnrollments(): Promise<StoredEnrollment[]> {
  const col = await collection();
  return col.find({}, PROJECT_OUT_PHOTO).sort({ created_at: -1 }).toArray();
}

export async function findByNin(nin: string): Promise<StoredEnrollment[]> {
  const col = await collection();
  return col.find({ NIN: nin }, PROJECT_OUT_PHOTO).toArray();
}

export async function insertEnrollment(doc: Omit<StoredEnrollment, "created_at">): Promise<void> {
  const col = await collection();
  await col.insertOne({ ...doc, created_at: new Date() });
}

export async function findByEnrollmentId(id: string): Promise<StoredEnrollment | null> {
  const col = await collection();
  return col.findOne({ enrollment_id: id }, PROJECT_OUT_PHOTO);
}

export async function findPhotoByEnrollmentId(id: string): Promise<Pick<StoredEnrollment, "photo_base64" | "photo_mime_type"> | null> {
  const col = await collection();
  return col.findOne({ enrollment_id: id }, PROJECT_ONLY_PHOTO);
}

export async function updateEnrollmentByEnrollmentId(
  id: string,
  patch: Partial<Omit<StoredEnrollment, "enrollment_id" | "created_at">>,
): Promise<StoredEnrollment | null> {
  const col = await collection();
  return col.findOneAndUpdate({ enrollment_id: id }, { $set: patch }, { returnDocument: "after", projection: PROJECT_OUT_PHOTO.projection });
}
