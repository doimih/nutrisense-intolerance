import 'server-only';

const BREVO_EVENTS_API = 'https://in-automate.brevo.com/api/v2/trackEvent';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BrevoEventName =
  | 'user_logged_in'
  | 'ai_chat_used'
  | 'meal_plan_generated'
  | 'food_scan'
  | 'onboarding_step_completed'
  | 'subscription_started'
  | 'subscription_upgraded'
  | 'subscription_downgraded'
  | 'subscription_canceled'
  | 'daily_checkin'
  | 'weight_logged'
  | 'recipe_saved'
  | 'favorite_added'
  | 'error_occurred';

export type BrevoEventProperties = Record<string, string | number | boolean | null>;

// ─── Config cache (5-min TTL) ─────────────────────────────────────────────────

type EventsConfig = { eventsKey: string };

let configCache: { value: EventsConfig; expiresAt: number } | null = null;

async function getEventsConfig(): Promise<EventsConfig | null> {
  const now = Date.now();
  if (configCache && now < configCache.expiresAt) return configCache.value;

  try {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.BACKEND_URL ||
      'https://backend.nutriaid.eu';

    const settingsRes = await fetch(`${backendUrl}/api/public/settings`, { cache: 'no-store' });
    if (!settingsRes.ok) return null;

    const settings = (await settingsRes.json()) as { settings?: { internalEmailToken?: string } };
    const token = settings?.settings?.internalEmailToken;
    if (!token) return null;

    const brevoRes = await fetch(`${backendUrl}/api/internal/brevo-key`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!brevoRes.ok) return null;

    const config = (await brevoRes.json()) as { eventsKey?: string };
    if (!config.eventsKey) return null;

    const value: EventsConfig = { eventsKey: config.eventsKey };
    configCache = { value, expiresAt: now + 5 * 60 * 1000 };
    return value;
  } catch {
    return null;
  }
}

// ─── Rate limiter (max 100 events / email / minute) ───────────────────────────

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(email, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

// ─── Core send with retry ─────────────────────────────────────────────────────

async function sendEventWithRetry(
  eventsKey: string,
  eventName: BrevoEventName,
  email: string,
  properties?: BrevoEventProperties,
): Promise<void> {
  // Strip null values — Brevo Events API does not accept null property values
  const cleanProps: Record<string, string | number | boolean> = {};
  if (properties) {
    for (const [k, v] of Object.entries(properties)) {
      if (v !== null && v !== undefined) cleanProps[k] = v;
    }
  }

  const payload = {
    event: eventName,
    email,
    properties: cleanProps,
  };

  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const res = await fetch(BREVO_EVENTS_API, {
        method: 'POST',
        headers: {
          'ma-key': eventsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 204) return;

      // 4xx errors won't be fixed by retrying
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text().catch(() => '');
        console.error(`[BrevoEvents] ${eventName} failed ${res.status}:`, body);
        return;
      }

      // 5xx — retry
      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    } catch (err) {
      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      } else {
        console.error(`[BrevoEvents] ${eventName} network error after retries:`, err);
      }
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendBrevoEvent(
  eventName: BrevoEventName,
  email: string,
  properties?: BrevoEventProperties,
): Promise<void> {
  if (!email) return;
  if (isRateLimited(email)) return;

  const config = await getEventsConfig();
  if (!config) return;

  await sendEventWithRetry(config.eventsKey, eventName, email, properties);
}

// ─── Typed event helpers (all non-blocking when used with void) ───────────────

export const brevoEvents = {
  userLoggedIn: (email: string, props?: { method?: string; ip?: string }) =>
    sendBrevoEvent('user_logged_in', email, props),

  aiChatUsed: (email: string, props?: { intent?: string; workerCount?: number; latencyMs?: number }) =>
    sendBrevoEvent('ai_chat_used', email, props),

  mealPlanGenerated: (email: string, props?: { mealCount?: number; calories?: number }) =>
    sendBrevoEvent('meal_plan_generated', email, props),

  foodScanned: (email: string, props?: { foodName?: string; calories?: number }) =>
    sendBrevoEvent('food_scan', email, props),

  onboardingStepCompleted: (email: string, props?: { step: string; stepIndex?: number }) =>
    sendBrevoEvent('onboarding_step_completed', email, props),

  subscriptionStarted: (email: string, props?: { plan: string; provider?: string; amount?: number }) =>
    sendBrevoEvent('subscription_started', email, props),

  subscriptionUpgraded: (email: string, props?: { fromPlan: string; toPlan: string }) =>
    sendBrevoEvent('subscription_upgraded', email, props),

  subscriptionDowngraded: (email: string, props?: { fromPlan: string; toPlan: string }) =>
    sendBrevoEvent('subscription_downgraded', email, props),

  subscriptionCanceled: (email: string, props?: { plan: string; reason?: string }) =>
    sendBrevoEvent('subscription_canceled', email, props),

  dailyCheckin: (email: string, props?: { mood?: string; energy?: number }) =>
    sendBrevoEvent('daily_checkin', email, props),

  weightLogged: (email: string, props?: { weightKg?: number; unit?: string }) =>
    sendBrevoEvent('weight_logged', email, props),

  recipeSaved: (email: string, props?: { recipeName?: string; calories?: number }) =>
    sendBrevoEvent('recipe_saved', email, props),

  favoriteAdded: (email: string, props?: { itemType?: string; itemName?: string }) =>
    sendBrevoEvent('favorite_added', email, props),

  errorOccurred: (email: string, props?: { errorCode?: string; message?: string; route?: string }) =>
    sendBrevoEvent('error_occurred', email, props),
};
