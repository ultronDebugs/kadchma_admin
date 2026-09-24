import { NextResponse } from "next/server";
import { countUsers } from "@/lib/user-repo";
import { isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public, unauthenticated: tells the login page whether to show the "create the first administrator" form. */
export async function GET() {
  if (!isMongoConfigured()) {
    return NextResponse.json({ needsBootstrap: false, configured: false });
  }
  const count = await countUsers();
  return NextResponse.json({ needsBootstrap: count === 0, configured: true });
}
