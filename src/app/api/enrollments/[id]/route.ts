import { NextRequest, NextResponse } from "next/server";
import { findByEnrollmentId, updateEnrollmentByEnrollmentId } from "@/lib/enrollment-repo";
import { normalizeIncomingStatus } from "@/lib/enrollment-mapping";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const key = process.env.ENROLLMENTS_API_KEY;
  return Boolean(key) && req.headers.get("authorization") === `Bearer ${key}`;
}

// Fields the Paystack webhook flow (and any future caller) may update —
// deliberately excludes identity/PII fields, which only save_enrollment sets.
const PATCHABLE_FIELDS = ["payment_status", "payment_reference", "payment_proof_note", "status"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }
  const { id } = await params;
  const doc = await findByEnrollmentId(decodeURIComponent(id));
  if (!doc) {
    return NextResponse.json({ error: `enrollment_id ${id} not found` }, { status: 404 });
  }
  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  for (const field of PATCHABLE_FIELDS) {
    if (typeof body[field] === "string") patch[field] = body[field];
  }
  if (patch.status) patch.status = normalizeIncomingStatus(patch.status);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: `No patchable fields provided (expected one of: ${PATCHABLE_FIELDS.join(", ")})` }, { status: 400 });
  }

  try {
    const updated = await updateEnrollmentByEnrollmentId(decodeURIComponent(id), patch);
    if (!updated) {
      return NextResponse.json({ error: `enrollment_id ${id} not found` }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
