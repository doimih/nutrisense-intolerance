import { NextRequest, NextResponse } from "next/server";
import { setPasswordById } from "@/lib/server/authStore";

export const runtime = "nodejs";

const SUPERADMIN_FRONTEND_ID = "usr_frontend_superadmin";

function verifyRequest(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_SYNC_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token === secret;
}

export async function POST(request: NextRequest) {
  if (!verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { newPassword?: string };
  const newPassword = body.newPassword || "";

  if (!newPassword || newPassword.length < 10) {
    return NextResponse.json(
      { error: "newPassword must be at least 10 characters." },
      { status: 400 }
    );
  }

  const ok = await setPasswordById(SUPERADMIN_FRONTEND_ID, newPassword);
  if (!ok) {
    return NextResponse.json(
      { error: `Frontend superadmin user '${SUPERADMIN_FRONTEND_ID}' not found in database.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
