import { NextRequest, NextResponse } from "next/server";
import { getRuntimeSettings } from "@/lib/server/runtimeSettings";

export const runtime = "nodejs";

type TikTokEventPayload = {
  event: string;
  eventId?: string;
  url?: string;
  userEmail?: string;
  userPhone?: string;
  ip?: string;
  userAgent?: string;
  params?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const settings = await getRuntimeSettings();

  if (!settings.tiktok.enabled || !settings.tiktok.pixelId) {
    return NextResponse.json({ ok: false, reason: "TikTok not configured." }, { status: 200 });
  }

  // Access token is not in runtimeSettings (it's secret) — read from backend directly
  let accessToken = "";
  try {
    const backendUrl = (process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_URL || "").replace(/\/$/, "");
    const internalToken = settings.internalEmailToken;
    if (backendUrl && internalToken) {
      const res = await fetch(`${backendUrl}/api/internal/tiktok-config`, {
        headers: { Authorization: `Bearer ${internalToken}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { accessToken?: string };
        accessToken = data.accessToken ?? "";
      }
    }
  } catch {
    // fallback: no server-side tracking without token
  }

  if (!accessToken) {
    return NextResponse.json({ ok: false, reason: "No access token." }, { status: 200 });
  }

  let body: TikTokEventPayload;
  try {
    body = (await request.json()) as TikTokEventPayload;
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid body." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "0.0.0.0";
  const userAgent = request.headers.get("user-agent") || "";

  const eventData: Record<string, unknown> = {
    pixel_code: settings.tiktok.pixelId,
    event: body.event,
    event_id: body.eventId || `${body.event}_${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      page: { url: body.url || "" },
      user_agent: body.userAgent || userAgent,
      ip: body.ip || ip,
    },
    properties: body.params || {},
  };

  if (body.userEmail) {
    const crypto = await import("crypto");
    (eventData.context as Record<string, unknown>).user = {
      email: crypto.createHash("sha256").update(body.userEmail.toLowerCase().trim()).digest("hex"),
    };
  }

  if (settings.tiktok.testEventCode) {
    eventData.test_event_code = settings.tiktok.testEventCode;
  }

  try {
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({ data: [eventData] }),
    });

    const result = (await res.json()) as { code?: number; message?: string };
    return NextResponse.json({ ok: result.code === 0, code: result.code, message: result.message });
  } catch {
    return NextResponse.json({ ok: false, reason: "TikTok API error." }, { status: 500 });
  }
}
