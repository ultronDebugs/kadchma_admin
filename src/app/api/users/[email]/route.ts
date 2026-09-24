import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { updateUserByEmail } from "@/lib/user-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES = ["Enrollment Officer", "Facility Supervisor", "Zonal Coordinator", "System Administrator"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ email: string }> }) {
  const session = await getSessionUser();
  if (!session || session.role !== "System Administrator") {
    return NextResponse.json({ error: "Only a System Administrator can manage user accounts" }, { status: 403 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const { email } = await params;
  const body = (await req.json().catch(() => null)) as { role?: string; account?: string } | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const patch: { role?: string; account?: "Active" | "Suspended" } = {};
  if (body.role) {
    if (!ROLES.includes(body.role)) return NextResponse.json({ error: `Invalid role: ${body.role}` }, { status: 400 });
    patch.role = body.role;
  }
  if (body.account) {
    if (body.account !== "Active" && body.account !== "Suspended") {
      return NextResponse.json({ error: `Invalid account state: ${body.account}` }, { status: 400 });
    }
    patch.account = body.account;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Provide role and/or account to update" }, { status: 400 });
  }

  const updated = await updateUserByEmail(decodeURIComponent(email), patch);
  if (!updated) return NextResponse.json({ error: `${email} not found` }, { status: 404 });
  return NextResponse.json(updated);
}
