import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { readSessionToken } from "@/lib/auth/sessionToken";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const session = await readSessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const { email, id: userId } = session.user;

  // Collect profile
  let profile: unknown = null;
  const profilePath = join(process.cwd(), "data", "profile-db.json");
  if (existsSync(profilePath)) {
    try {
      const db = JSON.parse(readFileSync(profilePath, "utf8")) as {
        profiles?: Array<Record<string, unknown>>;
      };
      profile =
        db.profiles?.find(
          (p) => p.userId === userId || p.email === email || p.userEmail === email
        ) ?? null;
    } catch {
      // ignore
    }
  }

  // Collect monitoring entries
  let monitoringEntries: unknown[] = [];
  const monitoringPath = join(process.cwd(), "data", "monitoring-db.json");
  if (existsSync(monitoringPath)) {
    try {
      const db = JSON.parse(readFileSync(monitoringPath, "utf8")) as {
        entries?: Array<Record<string, unknown>>;
      };
      monitoringEntries = (db.entries ?? []).filter(
        (e) => e.userId === userId || e.email === email || e.userEmail === email
      );
    } catch {
      // ignore
    }
  }

  // Collect guidance history
  let guidanceHistory: unknown[] = [];
  const guidancePath = join(process.cwd(), "data", "guidance-db.json");
  if (existsSync(guidancePath)) {
    try {
      const db = JSON.parse(readFileSync(guidancePath, "utf8")) as {
        entries?: Array<Record<string, unknown>>;
      };
      guidanceHistory = (db.entries ?? []).filter(
        (e) => e.userId === userId || e.email === email || e.userEmail === email
      );
    } catch {
      // ignore
    }
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: { email, id: userId },
    profile,
    monitoringEntries,
    guidanceHistory,
  };

  const filename = `nutriaid-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
