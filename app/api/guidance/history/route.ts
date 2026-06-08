import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import {
  deleteAllGuidanceForUser,
  deleteGuidanceByIdForUser,
  listGuidanceByUser,
} from "@/lib/server/guidance/store";

export const runtime = "nodejs";

function toHistorySummary(email: string) {
  return listGuidanceByUser(email).map((record) => ({
    id: record.result.id,
    generatedAt: record.result.generatedAt,
    intolerances: record.result.intolerances,
    dietaryPreference: record.result.dietaryPreference,
    summary: record.result.warnings?.[0] || "Generated guidance",
  }));
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  return NextResponse.json({ history: toHistorySummary(session.user.email) });
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await readSessionToken(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const deleted = deleteGuidanceByIdForUser(session.user.email, id);
    if (!deleted) {
      return NextResponse.json({ error: "Guidance entry not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, deleted: 1 });
  }

  const count = deleteAllGuidanceForUser(session.user.email);
  return NextResponse.json({ ok: true, deleted: count });
}
