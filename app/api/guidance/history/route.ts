import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import {
  deleteAllGuidanceForUser,
  deleteGuidanceByIdForUser,
  listGuidanceByUser,
} from "@/lib/server/guidance/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const records = await listGuidanceByUser(session.user.email);
  const history = records.map((record) => ({
    id: record.result.id,
    generatedAt: record.result.generatedAt,
    intolerances: record.result.intolerances,
    dietaryPreference: record.result.dietaryPreference,
    summary: record.result.warnings?.[0] || "Generated guidance",
  }));

  return NextResponse.json({ history });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const deleted = await deleteGuidanceByIdForUser(session.user.email, id);
    if (!deleted) {
      return NextResponse.json({ error: "Guidance entry not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: 1 });
  }

  const count = await deleteAllGuidanceForUser(session.user.email);
  return NextResponse.json({ ok: true, deleted: count });
}
