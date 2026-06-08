/* eslint-disable no-console */
const base = process.env.SUPERADMIN_BASE_URL || 'http://localhost:4028';
const rootBase = process.env.ROOT_BASE_URL || 'http://localhost:3000';
const superadminEmail = process.env.SUPERADMIN_EMAIL || 'design@doimih.net';
const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'PassTemp123!';

const jar = new Map();

function setCookie(setCookieHeader) {
  if (!setCookieHeader) return;
  const arr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const raw of arr) {
    const [pair] = raw.split(';');
    const [key, value] = pair.split('=');
    if (key && value !== undefined) jar.set(key.trim(), value.trim());
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function api(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (jar.size > 0) headers.set('cookie', cookieHeader());
  if (!headers.get('content-type') && init.body) headers.set('content-type', 'application/json');

  const response = await fetch(`${base}${path}`, { ...init, headers });
  setCookie(response.headers.getSetCookie ? response.headers.getSetCookie() : response.headers.get('set-cookie'));
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { response, json };
}

async function run() {
  console.log('E2E 4.1 - user -> subscription modifications');
  let r = await api('/api/superadmin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: superadminEmail, password: superadminPassword }),
  });
  if (!r.response.ok) throw new Error(`Login failed: ${JSON.stringify(r.json)}`);

  const testEmail = `qa+${Date.now()}@nutriaid.local`;
  r = await api('/api/superadmin/users', {
    method: 'POST',
    body: JSON.stringify({ name: 'QA User', email: testEmail, plan: 'free' }),
  });
  if (!r.response.ok) throw new Error(`Create user failed: ${JSON.stringify(r.json)}`);
  const userId = r.json?.user?.id;

  const actions = [
    { action: 'upgrade', plan: 'pro' },
    { action: 'downgrade', plan: 'free' },
    { action: 'deactivate' },
    { action: 'activate' },
    { action: 'reset-subscription' },
  ];

  for (const step of actions) {
    const rs = await api('/api/superadmin/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, ...step }),
    });
    if (!rs.response.ok) throw new Error(`Action ${step.action} failed: ${JSON.stringify(rs.json)}`);
  }

  console.log('E2E 4.2 - Stripe webhook security + subscription consistency');
  const webhookResp = await fetch(`${rootBase}/api/billing/webhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ping: true }),
  });
  if (webhookResp.status !== 400) {
    throw new Error(`Expected webhook signature rejection 400, got ${webhookResp.status}`);
  }

  const subs = await api('/api/superadmin/subscriptions');
  if (!subs.response.ok || !Array.isArray(subs.json?.subscriptions)) {
    throw new Error('Failed to list subscriptions');
  }

  console.log('E2E 4.3 - AI rerun -> logs');
  const aiRun = await api('/api/superadmin/ai', {
    method: 'POST',
    body: JSON.stringify({ userId, userEmail: testEmail }),
  });
  if (!aiRun.response.ok) throw new Error(`AI rerun failed: ${JSON.stringify(aiRun.json)}`);

  const aiState = await api('/api/superadmin/ai');
  if (!aiState.response.ok || !Array.isArray(aiState.json?.logs)) {
    throw new Error('AI logs fetch failed');
  }

  console.log('E2E 4.4 - critical errors -> dashboard visibility');
  const logRes = await api('/api/superadmin/logs', {
    method: 'POST',
    body: JSON.stringify({ source: 'error', level: 'error', message: 'E2E critical error probe' }),
  });
  if (!logRes.response.ok) throw new Error(`Log ingest failed: ${JSON.stringify(logRes.json)}`);

  const dash = await api('/api/superadmin/dashboard');
  if (!dash.response.ok || !dash.json?.infrastructure) {
    throw new Error('Dashboard fetch failed');
  }
  if (typeof dash.json.infrastructure.criticalErrors !== 'number') {
    throw new Error('Dashboard criticalErrors missing');
  }

  console.log('All requested E2E flows passed (4.1, 4.2, 4.3, 4.4).');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
