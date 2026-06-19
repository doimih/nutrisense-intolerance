import 'server-only';

const BREVO_API_BASE = 'https://api.brevo.com/v3';

type BrevoConfig = {
  apiKey: string;
  listIdUsers: string;
  listIdPublic: string;
};

type BrevoAttributes = {
  FIRSTNAME?: string;
  LANGUAGE?: string;
  SOURCE?: string;
  CONSENT_TS?: string;
  CONSENT_SOURCE?: string;
};

async function getBrevoConfig(): Promise<BrevoConfig | null> {
  try {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      'https://backend.nutriaid.eu';

    // First fetch the internalEmailToken from the public settings endpoint
    const settingsRes = await fetch(`${backendUrl}/api/public/settings`, {
      cache: 'no-store',
    });
    if (!settingsRes.ok) return null;

    const settings = (await settingsRes.json()) as {
      settings?: { internalEmailToken?: string };
    };
    const token = settings?.settings?.internalEmailToken;
    if (!token) return null;

    // Now fetch the brevo config using the internal token
    const brevoRes = await fetch(`${backendUrl}/api/internal/brevo-key`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!brevoRes.ok) return null;

    const config = (await brevoRes.json()) as BrevoConfig;
    if (!config.apiKey) return null;

    return config;
  } catch {
    return null;
  }
}

export async function addOrUpdateContact(
  email: string,
  attributes: BrevoAttributes,
  listIds: number[],
): Promise<boolean> {
  const config = await getBrevoConfig();
  if (!config) return false;

  try {
    const res = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds,
        updateEnabled: true,
      }),
    });
    // 201 = created, 204 = updated — both are success
    return res.status === 201 || res.status === 204;
  } catch {
    return false;
  }
}

export async function addUserContact(params: {
  email: string;
  firstName: string;
  language: string;
  consentSource: 'signup_popup' | 'footer_form';
  consentAt: string;
}): Promise<boolean> {
  const config = await getBrevoConfig();
  if (!config) return false;

  const listId = params.consentSource === 'footer_form'
    ? parseInt(config.listIdPublic, 10)
    : parseInt(config.listIdUsers, 10);

  if (isNaN(listId)) return false;

  return addOrUpdateContact(
    params.email,
    {
      FIRSTNAME: params.firstName,
      LANGUAGE: params.language,
      SOURCE: params.consentSource === 'footer_form' ? 'Footer Form' : 'NutriAID Platform',
      CONSENT_TS: params.consentAt,
      CONSENT_SOURCE: params.consentSource,
    },
    [listId],
  );
}
