/* eslint-disable no-console */
const base = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

function randomEmail(tag) {
  return `qa+${tag}+${Date.now()}@nutriaid.local`;
}

function createJar() {
  const jar = new Map();
  return {
    setFromResponse(response) {
      const setCookie = response.headers.get("set-cookie");
      if (!setCookie) return;
      const [pair] = setCookie.split(";");
      const [key, value] = pair.split("=");
      if (key && value !== undefined) jar.set(key.trim(), value.trim());
    },
    header() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function api(jar, path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (jar.header()) headers.set("cookie", jar.header());
  if (init.body && !headers.get("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`${base}${path}`, {
    ...init,
    headers,
  });
  jar.setFromResponse(response);

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  return { response, json };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function containsDisallowedText(result) {
  const text = JSON.stringify(result).toLowerCase();
  const banned = [
    "diagnostic",
    "tratament",
    "medicament",
    "supliment",
    "prescr",
    "boala",
    "always",
    "never",
    "intotdeauna",
  ];
  return banned.find((word) => text.includes(word)) || null;
}

async function registerAndLogin(jar, email) {
  const password = "PassTemp123!";
  const register = await api(jar, "/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "QA AI User",
      email,
      password,
      confirmPassword: password,
      acceptTerms: true,
    }),
  });

  if (register.response.status === 409) {
    const login = await api(jar, "/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    assert(login.response.ok, `Login failed: ${JSON.stringify(login.json)}`);
    return;
  }

  assert(register.response.ok, `Register failed: ${JSON.stringify(register.json)}`);
}

async function setSubscriptionTier(jar, tier) {
  const mapping = {
    new: { status: "none", planCode: null },
    active: { status: "active", planCode: "pro" },
    expired: { status: "canceled", planCode: "basic" },
  };

  const res = await api(jar, "/api/testing/subscription", {
    method: "PATCH",
    body: JSON.stringify(mapping[tier]),
  });

  assert(res.response.ok, `Set tier failed (${tier}): ${JSON.stringify(res.json)}`);
}

function buildGuidanceBody() {
  return {
    intolerances: ["lactoza", "gluten"],
    dietaryPreference: "normal",
    detailLevel: "detailed",
    monitoringEntries: [
      {
        date: "2026-06-08",
        hour: "08:30",
        consumedFoods: ["milk", "toast", "coffee"],
        symptoms: ["balonare"],
        symptomsIntensity: 4,
        reactionLatencyMinutes: 45,
        notes: "Morning discomfort",
      },
      {
        date: "2026-06-08",
        hour: "13:15",
        consumedFoods: ["rice", "chicken", "salad"],
        symptoms: [],
        symptomsIntensity: 0,
        reactionLatencyMinutes: null,
        notes: "No symptoms",
      },
    ],
  };
}

async function runTierCase(tier) {
  const jar = createJar();
  const email = randomEmail(tier);

  await registerAndLogin(jar, email);
  await setSubscriptionTier(jar, tier);

  const body = buildGuidanceBody();

  const t0 = Date.now();
  const generate = await api(jar, "/api/guidance", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const latency = Date.now() - t0;

  assert(generate.response.ok, `Guidance failed (${tier}): ${JSON.stringify(generate.json)}`);
  assert(latency < 7000, `Latency too high (${tier}): ${latency}ms`);
  assert(generate.json?.result?.id, `Missing result id (${tier})`);

  const bannedWord = containsDisallowedText(generate.json?.result);
  assert(!bannedWord, `Safety violation (${tier}): contains '${bannedWord}'`);

  const duplicateA = await api(jar, "/api/guidance", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const duplicateB = await api(jar, "/api/guidance", {
    method: "POST",
    body: JSON.stringify(body),
  });

  assert(duplicateA.response.ok && duplicateB.response.ok, `Duplicate requests failed (${tier})`);

  const history = await api(jar, "/api/guidance/history", { method: "GET" });
  assert(history.response.ok, `History failed (${tier})`);
  assert(Array.isArray(history.json?.history), `History malformed (${tier})`);
  assert(history.json.history.length >= 1, `History empty (${tier})`);

  const resultId = generate.json.result.id;
  const occurrences = history.json.history.filter((item) => item.id === resultId).length;
  assert(occurrences === 1, `Duplicate guidance persisted (${tier})`);

  const exported = await api(jar, "/api/guidance/export", { method: "GET" });
  assert(exported.response.ok, `Export failed (${tier})`);
  assert(Array.isArray(exported.json?.history), `Export malformed (${tier})`);

  const deleteOne = await api(
    jar,
    `/api/guidance/history?id=${encodeURIComponent(resultId)}`,
    { method: "DELETE" }
  );
  assert(deleteOne.response.ok, `Delete single failed (${tier})`);

  const deleteAll = await api(jar, "/api/guidance/history", { method: "DELETE" });
  assert(deleteAll.response.ok, `Delete all failed (${tier})`);

  console.log(`Tier ${tier}: OK (latency ${latency}ms)`);
}

async function run() {
  console.log("User AI E2E: new, active, expired");
  await runTierCase("new");
  await runTierCase("active");
  await runTierCase("expired");
  console.log("User AI checklist E2E passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
