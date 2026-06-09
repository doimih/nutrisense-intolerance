import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/superadmin/store';

export const runtime = 'nodejs';

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return false;
  const stored = readDb().settings?.internalEmailToken;
  return !!(stored && token === stored);
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = readDb().settings?.stripe;

  return NextResponse.json({
    secretKey: stripe?.secretKeyMasked || null,
    webhookSecret: stripe?.webhookSecretMasked || null,
    publishableKey: stripe?.publishableKeyMasked || null,
    products: {
      basic: {
        productId: stripe?.products?.basic?.productId ?? '',
        priceId: stripe?.products?.basic?.priceId ?? '',
      },
      pro: {
        productId: stripe?.products?.pro?.productId ?? '',
        priceId: stripe?.products?.pro?.priceId ?? '',
      },
      pro_plus: {
        productId: stripe?.products?.pro_plus?.productId ?? '',
        priceId: stripe?.products?.pro_plus?.priceId ?? '',
      },
    },
  });
}
