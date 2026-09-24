import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { listAudit } from "@/lib/audit-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isMongoConfigured()) return NextResponse.json({ configured: false, entries: [] });

  const entries = await listAudit();
  return NextResponse.json({ configured: true, entries });
}
