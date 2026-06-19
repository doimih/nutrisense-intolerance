import { NextRequest, NextResponse } from 'next/server';
import { getRuntimeSettings } from '@/lib/server/runtimeSettings';
import { sendBrevoEvent, type BrevoEventName } from '@/lib/server/brevoEventService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const settings = await getRuntimeSettings();
  const token = settings.internalEmailToken;

  const auth = request.headers.get('authorization');
  if (!token || !auth?.startsWith('Bearer ') || auth.slice(7) !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { event?: string; email?: string; properties?: Record<string, unknown> };
  const { event, email, properties } = body;

  if (!event || !email) {
    return NextResponse.json({ error: 'event and email are required' }, { status: 400 });
  }

  try {
    await sendBrevoEvent(event as BrevoEventName, email, properties as Record<string, string | number | boolean | null>);
    return NextResponse.json({ ok: true, event, email });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
