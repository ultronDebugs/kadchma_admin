import { NextRequest, NextResponse } from "next/server";
import { ensurePhotoIndexes, stagePhoto } from "@/lib/photo-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const key = process.env.ENROLLMENTS_API_KEY;
  return Boolean(key) && req.headers.get("authorization") === `Bearer ${key}`;
}

// Generous but bounded — WhatsApp/Instagram-compressed photos are typically
// well under 1MB; this caps the base64 string (~4/3 of binary size) at ~8MB binary.
const MAX_BASE64_LENGTH = 11 * 1024 * 1024;

/** Bot-facing: stages a photo by contact_id ahead of save_enrollment, which consumes it. */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as { contact_id?: string; photo_base64?: string; mime_type?: string } | null;
  const contactId = body?.contact_id?.trim();
  const photoBase64 = body?.photo_base64?.trim();
  const mimeType = body?.mime_type?.trim() || "image/jpeg";

  if (!contactId || !photoBase64) {
    return NextResponse.json({ error: "contact_id and photo_base64 are required" }, { status: 400 });
  }
  if (photoBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ error: "Photo is too large" }, { status: 413 });
  }
  if (!mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "mime_type must be an image type" }, { status: 400 });
  }

  await ensurePhotoIndexes();
  await stagePhoto(contactId, photoBase64, mimeType);
  return NextResponse.json({ success: true }, { status: 201 });
}
