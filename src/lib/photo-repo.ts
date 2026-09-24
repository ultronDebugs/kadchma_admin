import { getDb } from "@/lib/mongodb";

// A passport photo often arrives as its own WhatsApp/Instagram message,
// separate from the conversational turn where save_enrollment is finally
// called — so it's staged here by contact_id and consumed (attached to the
// enrollment doc) the moment that enrollment is saved.
export type StagedPhoto = {
  contact_id: string;
  photo_base64: string;
  mime_type: string;
  createdAt: Date;
};

const COLLECTION = "pending_photos";

async function collection() {
  const db = await getDb();
  return db.collection<StagedPhoto>(COLLECTION);
}

export async function ensurePhotoIndexes() {
  const col = await collection();
  await col.createIndex({ contact_id: 1 }, { unique: true });
}

export async function stagePhoto(contactId: string, photoBase64: string, mimeType: string): Promise<void> {
  const col = await collection();
  await col.updateOne(
    { contact_id: contactId },
    { $set: { contact_id: contactId, photo_base64: photoBase64, mime_type: mimeType, createdAt: new Date() } },
    { upsert: true },
  );
}

/** Removes and returns the staged photo for a contact, if any — call this once, at enrollment save time. */
export async function consumePhotoForContact(contactId: string): Promise<StagedPhoto | null> {
  if (!contactId) return null;
  const col = await collection();
  return col.findOneAndDelete({ contact_id: contactId });
}
