import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSessionUser } from "@/lib/session";
import { countUsers, ensureUserIndexes, findUserWithHashByEmail, insertUser, listUsersSafe } from "@/lib/user-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isMongoConfigured()) return NextResponse.json({ configured: false, users: [] });

  const users = await listUsersSafe();
  return NextResponse.json({ configured: true, users });
}

const ROLES = ["Enrollment Officer", "Facility Supervisor", "Zonal Coordinator", "System Administrator"];

export async function POST(req: NextRequest) {
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MONGODB_URI is not configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; email?: string; password?: string; role?: string; scope?: string }
    | null;
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password ?? "";
  const scope = body?.scope?.trim() ?? "";

  if (!name || !email || password.length < 12) {
    return NextResponse.json({ error: "Name, email, and a password of at least 12 characters are required" }, { status: 400 });
  }

  const existingCount = await countUsers();
  const isBootstrap = existingCount === 0;

  if (!isBootstrap) {
    const session = await getSessionUser();
    if (!session || session.role !== "System Administrator") {
      return NextResponse.json({ error: "Only a System Administrator can register new users" }, { status: 403 });
    }
  }

  if (await findUserWithHashByEmail(email)) {
    return NextResponse.json({ error: `${email} is already registered` }, { status: 409 });
  }

  const role = isBootstrap ? "System Administrator" : body?.role && ROLES.includes(body.role) ? body.role : ROLES[0];
  const passwordHash = await bcrypt.hash(password, 12);

  await ensureUserIndexes();
  await insertUser({ name, email, passwordHash, role, scope, account: "Active" });

  return NextResponse.json({ success: true, bootstrap: isBootstrap }, { status: 201 });
}
