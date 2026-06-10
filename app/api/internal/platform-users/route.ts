import { NextRequest, NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";
import {
  listAllUsers,
  getUserById,
  getUserByEmail,
  activateUserById,
  deactivateUserById,
  editUserById,
  setPasswordById,
  setUserPlanById,
  removeUserPlan,
  deleteUserById,
  type AuthPlanCode,
} from "@/lib/server/authStore";
import { deleteProfileForUser } from "@/lib/server/profileStore";
import { deleteMonitoringEntriesByUser } from "@/lib/server/monitoringStore";
import { deleteAllGuidanceForUser } from "@/lib/server/guidance/store";
import { deleteUserProblem } from "@/lib/server/userProblemsStore";

export const runtime = "nodejs";

async function verifyRequest(request: NextRequest): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return false;
  try {
    const settings = await getRuntimeSettings();
    return !!(settings.internalEmailToken && token === settings.internalEmailToken);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!await verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const users = await listAllUsers();
    return NextResponse.json({
      users: users.map((u) => ({ ...u, source: "platform" as const })),
    });
  } catch {
    return NextResponse.json({ error: "Could not read user store." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!await verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    userId?: string;
    action?: "activate" | "deactivate" | "edit" | "set-password" | "set-plan";
    name?: string;
    email?: string;
    newPassword?: string;
    plan?: string;
  };

  if (!body.userId || !body.action) {
    return NextResponse.json({ error: "userId and action are required." }, { status: 400 });
  }

  // Look up by ID first; fall back to email for admin-source plan syncs
  let user = await getUserById(body.userId);
  if (!user && body.email) {
    user = await getUserByEmail(body.email);
  }
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (user.role === "superadmin") {
    return NextResponse.json({ error: "Cannot modify superadmin." }, { status: 403 });
  }

  if (body.action === "activate") {
    await activateUserById(body.userId);
  }

  if (body.action === "deactivate") {
    await deactivateUserById(body.userId);
  }

  if (body.action === "edit") {
    const nextName = body.name?.trim() || "";
    const nextEmail = body.email?.trim().toLowerCase() || "";
    if (!nextName || !nextEmail) {
      return NextResponse.json({ error: "name and email are required." }, { status: 400 });
    }
    const result = await editUserById(body.userId, { name: nextName, email: nextEmail });
    if (result.status === "duplicate_email") {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }
  }

  if (body.action === "set-plan") {
    const validPlans: Array<AuthPlanCode | "free"> = ["free", "basic", "pro", "pro_plus"];
    const plan = body.plan as AuthPlanCode | "free" | undefined;
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan. Must be free, basic, pro, or pro_plus." }, { status: 400 });
    }
    if (plan === "free") {
      await removeUserPlan(user.email);
    } else {
      await setUserPlanById(user.id, plan);
    }
  }

  if (body.action === "set-password") {
    const newPassword = body.newPassword || "";
    if (newPassword.length < 10) {
      return NextResponse.json({ error: "Password must be at least 10 characters." }, { status: 400 });
    }
    await setPasswordById(body.userId, newPassword);
  }

  const updated = await getUserById(body.userId);
  return NextResponse.json({
    user: updated ? { ...updated, source: "platform" as const } : null,
  });
}

export async function DELETE(request: NextRequest) {
  if (!await verifyRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  if (!body.userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const result = await deleteUserById(body.userId);
  if (result.status === "not_found") {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (result.status === "forbidden") {
    return NextResponse.json({ error: "Cannot delete superadmin." }, { status: 403 });
  }

  const email = result.email;
  await Promise.all([
    deleteProfileForUser(email),
    deleteMonitoringEntriesByUser(email),
    deleteAllGuidanceForUser(email),
    deleteUserProblem(email),
  ]);

  return NextResponse.json({ ok: true });
}
