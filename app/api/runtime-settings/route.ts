import { NextResponse } from 'next/server';
import { getRuntimeSettings } from '@/lib/server/runtimeSettings';

export const runtime = 'nodejs';

export async function GET() {
  const settings = await getRuntimeSettings();
  return NextResponse.json({
    settings: {
      recaptcha: {
        enabled: settings.recaptcha.enabled,
        siteKey: settings.recaptcha.siteKey,
      },
    },
  });
}
