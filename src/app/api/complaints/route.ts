import { NextRequest, NextResponse } from "next/server";
import { ensureIndexes, insertComplaint, listComplaints } from "@/lib/complaint-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const key = process.env.ENROLLMENTS_API_KEY;
  return Boolean(key) && req.headers.get("authorization") === `Bearer ${key}`;
}

export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({ configured: false, complaints: [] });
  }
  try {
    const complaints = await listComplaints();
    return NextResponse.json({ configured: true, complaints });
  } catch (err) {
    return NextResponse.json({ configured: true, complaints: [], error: (err as Error).message }, { status: 502 });
  }
}

const REQUIRED_FIELDS = ["full_name", "phone_number", "complaint_category", "complaint_details"] as const;

function generateComplaintId() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${ymd}-${suffix}`;
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
  const complaintId = str(body.complaint_id) || generateComplaintId();

  try {
    await ensureIndexes();
    await insertComplaint({
      complaint_id: complaintId,
      enrollment_id: str(body.enrollment_id),
      full_name: str(body.full_name),
      phone_number: str(body.phone_number),
      channel: str(body.channel) || "WhatsApp",
      complaint_category: str(body.complaint_category),
      complaint_details: str(body.complaint_details),
      status: str(body.status) || "Open",
      submitted_at: str(body.submitted_at) || new Date().toISOString(),
    });
    return NextResponse.json({ success: true, complaint_id: complaintId }, { status: 201 });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: `complaint_id ${complaintId} already exists` }, { status: 409 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 502 });
  }
}
