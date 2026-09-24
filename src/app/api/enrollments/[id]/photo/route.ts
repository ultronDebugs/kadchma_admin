import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { findPhotoByEnrollmentId } from "@/lib/enrollment-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const { id } = await params;
  const doc = await findPhotoByEnrollmentId(decodeURIComponent(id));
  if (!doc || !doc.photo_base64) {
    return NextResponse.json({ error: "No photo on file for this enrollment" }, { status: 404 });
  }
  return NextResponse.json({ photo_base64: doc.photo_base64, mime_type: doc.photo_mime_type || "image/jpeg" });
}
