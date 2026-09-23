import { NextRequest, NextResponse } from "next/server";
import { ensureIndexes, findByNin, insertEnrollment, listEnrollments } from "@/lib/enrollment-repo";
import { toEnrollmentRecord } from "@/lib/enrollment-mapping";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const key = process.env.ENROLLMENTS_API_KEY;
  return Boolean(key) && req.headers.get("authorization") === `Bearer ${key}`;
}

export async function GET(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false, records: [] });
  }
  try {
    const nin = req.nextUrl.searchParams.get("nin");
    const docs = nin ? await findByNin(nin) : await listEnrollments();
    return NextResponse.json({ configured: true, records: docs.map(toEnrollmentRecord) });
  } catch (err) {
    return NextResponse.json({ configured: true, records: [], error: (err as Error).message }, { status: 502 });
  }
}

const REQUIRED_FIELDS = [
  "first_name",
  "last_name",
  "phone_number",
  "date_of_birth",
  "gender",
  "address",
  "plan_type",
  "facility_of_choice",
  "NIN",
  "enrolled_at",
  "status",
  "next_of_kin_name",
  "next_of_kin_phone",
  "next_of_kin_relationship",
] as const;

function generateEnrollmentId() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HI-${ymd}-${suffix}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter((f) => !String(body[f] ?? "").trim());
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
  }

  const str = (v: unknown) => String(v ?? "").trim();
  const enrollmentId = str(body.enrollment_id) || generateEnrollmentId();

  try {
    await ensureIndexes();
    await insertEnrollment({
      enrollment_id: enrollmentId,
      first_name: str(body.first_name),
      last_name: str(body.last_name),
      other_name: str(body.other_name),
      phone_number: str(body.phone_number),
      date_of_birth: str(body.date_of_birth),
      gender: body.gender === "Female" ? "Female" : "Male",
      address: str(body.address),
      plan_type: body.plan_type === "Family" ? "Family" : "Individual",
      facility_of_choice: str(body.facility_of_choice),
      NIN: str(body.NIN),
      email: str(body.email),
      payment_reference: str(body.payment_reference),
      payment_status: str(body.payment_status),
      payment_proof_note: str(body.payment_proof_note),
      status: str(body.status),
      enrolled_at: str(body.enrolled_at),
      contact_channel: str(body.contact_channel) || "WhatsApp",
      contact_id: str(body.contact_id),
      next_of_kin_name: str(body.next_of_kin_name),
      next_of_kin_phone: str(body.next_of_kin_phone),
      next_of_kin_relationship: str(body.next_of_kin_relationship),
    });
    return NextResponse.json({ success: true, enrollment_id: enrollmentId }, { status: 201 });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: `enrollment_id ${enrollmentId} already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
