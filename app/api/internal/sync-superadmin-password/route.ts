import { NextRequest, NextResponse } from "next/server";
import { setPasswordById } from "@/lib/server/authStore";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export const runtime = "nodejs";

const SUPERADMIN_FRONTEND_ID = "usr_frontend_superadmin";

async function verifyRequest(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return false;
  try {
    // getRuntimeSettings fetches from the backend — use a short timeout so we
    // don't hold up the request if the backend is slow to respond.
    const settings = await getRuntimeSettings();
    return !!(settings.internalEmailToken && token === settings.internalEmailToken);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyRequest(request))) {
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
