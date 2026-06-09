import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { listGuidanceByUser } from "@/lib/server/guidance/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const history = (await listGuidanceByUser(session.user.email)).map((entry) => entry.result);
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    history,
  });
}
