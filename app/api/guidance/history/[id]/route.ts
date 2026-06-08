import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { getGuidanceByIdForUser } from "@/lib/server/guidance/store";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const item = getGuidanceByIdForUser(session.user.email, context.params.id);
  if (!item) {
    return NextResponse.json({ error: "Guidance entry not found." }, { status: 404 });
  }

  return NextResponse.json({ result: item.result });
}
