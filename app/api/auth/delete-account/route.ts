import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";
import { deleteUserByEmail } from "@/lib/server/authStore";
import { deleteProfileForUser } from "@/lib/server/profileStore";
import { deleteMonitoringEntriesByUser } from "@/lib/server/monitoringStore";
import { deleteAllGuidanceForUser } from "@/lib/server/guidance/store";
import { deleteUserProblem } from "@/lib/server/userProblemsStore";
import { sendDeletionConfirmationEmail, sendDeletionFeedbackEmail } from "@/lib/server/email";
import { isAppLanguage } from "@/lib/i18n/config";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await readSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const email = session.user.email;
  const name = session.user.name;
  const rawLang = request.cookies.get("ns_lang")?.value;
  const lang = isAppLanguage(rawLang) ? rawLang : "ro";

  // Delete all associated data first, then remove the user
  await Promise.all([
    deleteProfileForUser(email),
    deleteMonitoringEntriesByUser(email),
    deleteAllGuidanceForUser(email),
    deleteUserProblem(email),
  ]);

  const result = await deleteUserByEmail(email);
  if (result.status === "forbidden") {
    return NextResponse.json({ error: "Superadmin accounts cannot be deleted." }, { status: 403 });
  }

  // Send deletion emails (fire-and-forget)
  sendDeletionFeedbackEmail({ email, name, lang }).catch(() => undefined);
  sendDeletionConfirmationEmail({ email, name, lang }).catch(() => undefined);

  const response = NextResponse.json({ ok: true, message: "Account deleted successfully." });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
