import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { findByEnrollmentId, updateEnrollmentByEnrollmentId } from "@/lib/enrollment-repo";
import { insertAudit } from "@/lib/audit-repo";
import { isMongoConfigured } from "@/lib/mongodb";
import type { Status } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: Status[] = ["Active", "Pending", "Expired", "Suspended", "Inactive"];

/** Staff-driven status change — the "I've keyed this into the portal" action, distinct from the Paystack webhook's automated PATCH. Records an audit entry under the signed-in staff member's name. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const { id } = await params;
  const enrollmentId = decodeURIComponent(id);
  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const nextStatus = body?.status;
  if (!nextStatus || !STATUSES.includes(nextStatus as Status)) {
    return NextResponse.json({ error: `status must be one of: ${STATUSES.join(", ")}` }, { status: 400 });
  }

  const existing = await findByEnrollmentId(enrollmentId);
  if (!existing) {
    return NextResponse.json({ error: `enrollment_id ${enrollmentId} not found` }, { status: 404 });
  }

  const fromStatus = existing.status as Status;
  const updated = await updateEnrollmentByEnrollmentId(enrollmentId, { status: nextStatus });
  if (!updated) {
    return NextResponse.json({ error: `enrollment_id ${enrollmentId} not found` }, { status: 404 });
  }

  await insertAudit({
    at: new Date(),
    admin: session.name,
    action: "Status change",
    enrollee: `${existing.first_name} ${existing.last_name}`.trim(),
    enrollmentId,
    from: STATUSES.includes(fromStatus) ? fromStatus : null,
    to: nextStatus as Status,
  });

  return NextResponse.json(updated);
}
