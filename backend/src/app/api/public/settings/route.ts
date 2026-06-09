import { NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

export async function GET() {
  const settings = readDb().settings;

  return NextResponse.json({
    settings: {
      app: {
        siteUrl: settings.app.siteUrl,
        backendUrl: settings.app.backendUrl,
        adminConsoleUrl: settings.app.adminConsoleUrl,
      },
      internalEmailToken: settings.internalEmailToken ?? null,
      recaptcha: {
        enabled: settings.recaptcha?.enabled ?? false,
        siteKey: settings.recaptcha?.siteKey ?? '',
        scoreThreshold: settings.recaptcha?.scoreThreshold ?? '0.5',
      },
      pricing: {
        basic: {
          amount: settings.pricing?.basic?.amount ?? '9.99',
          currency: settings.pricing?.basic?.currency ?? 'eur',
          interval: settings.pricing?.basic?.interval ?? 'month',
          features: settings.pricing?.basic?.features ?? [],
          description: settings.pricing?.basic?.description ?? '',
        },
        pro: {
          amount: settings.pricing?.pro?.amount ?? '14.99',
          currency: settings.pricing?.pro?.currency ?? 'eur',
          interval: settings.pricing?.pro?.interval ?? 'month',
          features: settings.pricing?.pro?.features ?? [],
          description: settings.pricing?.pro?.description ?? '',
        },
        pro_plus: {
          amount: settings.pricing?.pro_plus?.amount ?? '35.99',
          currency: settings.pricing?.pro_plus?.currency ?? 'eur',
          interval: settings.pricing?.pro_plus?.interval ?? 'month',
          features: settings.pricing?.pro_plus?.features ?? [],
          description: settings.pricing?.pro_plus?.description ?? '',
        },
      },
      pwa: {
        enabled: settings.pwa?.enabled ?? false,
        appName: settings.pwa?.appName ?? 'NutriAID',
        appShortName: settings.pwa?.appShortName ?? 'NutriAID',
        themeColor: settings.pwa?.themeColor ?? '#16a34a',
        backgroundColor: settings.pwa?.backgroundColor ?? '#f8faf8',
        vapidPublicKey: settings.pwa?.vapidPublicKey ?? '',
      },
    },
  });
}
