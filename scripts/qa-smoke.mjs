import { execSync, spawn } from "node:child_process";
import fs from "node:fs";

const FRONTEND_PORT = 3100;
const BACKEND_PORT = 4128;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const STARTUP_TIMEOUT_MS = 120000;
const CHECK_TIMEOUT_MS = 45000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnCommand(command, args, extraEnv = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  return child;
}

function waitForUnexpectedExit(child, name) {
  return new Promise((_, reject) => {
    child.once("exit", (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`${name} exited unexpectedly with code ${code}.`));
      }
    });
  });
}

async function withProcessGuard(promise, guards) {
  return Promise.race([promise, ...guards]);
}

async function waitForUrl(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // Ignore transient startup errors.
    }
    await sleep(1200);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: "manual", signal: controller.signal });
    const body = await res.text();
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function assertPage(url, assertions) {
  const { status, body } = await fetchText(url);
  if (status >= 500) {
    throw new Error(`Smoke check failed for ${url}. HTTP ${status}`);
  }

  for (const text of assertions.mustContain ?? []) {
    if (!body.includes(text)) {
      throw new Error(`Smoke check failed for ${url}. Missing text: ${text}`);
    }
  }

  for (const text of assertions.mustNotContain ?? []) {
    if (body.includes(text)) {
      throw new Error(`Smoke check failed for ${url}. Forbidden text found: ${text}`);
    }
  }
}

function stopProcess(child) {
  return new Promise((resolve) => {
    if (!child || child.killed) return resolve();
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
    setTimeout(() => resolve(), 4000);
  });
}

function cleanupPorts(ports) {
  if (process.platform !== "win32") return;

  try {
    const output = execSync("netstat -ano -p tcp", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    const pids = new Set();
    const lines = output.split(/\r?\n/);

    for (const line of lines) {
      if (!line.includes("LISTENING")) continue;
      for (const port of ports) {
        if (line.includes(`:${port}`)) {
          const tokens = line.trim().split(/\s+/);
          const pid = tokens[tokens.length - 1];
          if (pid && /^\d+$/.test(pid)) pids.add(pid);
        }
      }
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
      } catch {
        // Ignore processes that are already stopped.
      }
    }
  } catch {
    // Ignore cleanup issues to avoid masking primary smoke result.
  }
}

async function run() {
  const backendServerCandidates = [
    "backend/.next/standalone/server.js",
    "backend/.next/standalone/backend/server.js",
  ];
  const backendServerPath = backendServerCandidates.find((candidate) => fs.existsSync(candidate));
  if (!backendServerPath) {
    throw new Error("Backend standalone server entry was not found. Run build:backend before test:smoke.");
  }

  const frontend = spawnCommand("node", [".next/standalone/server.js"], {
    PORT: String(FRONTEND_PORT),
  });
  const backend = spawnCommand("node", [backendServerPath], {
    PORT: String(BACKEND_PORT),
  });
  const guards = [
    waitForUnexpectedExit(frontend, "Frontend server"),
    waitForUnexpectedExit(backend, "Backend server"),
  ];

  try {
    await withProcessGuard(waitForUrl(FRONTEND_URL, STARTUP_TIMEOUT_MS), guards);
    await withProcessGuard(waitForUrl(BACKEND_URL, STARTUP_TIMEOUT_MS), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/?lang=en`, {
      mustContain: ["NutriSense Intolerances", "Sign in"],
    }), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/?lang=ro`, {
      mustContain: ["NutriSense Intolerances", "Autentificare"],
    }), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/auth/login?lang=en`, {
      mustContain: ["Sign in"],
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/auth/login?lang=ro`, {
      mustContain: ["Autentificare"],
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/dashboard`, {
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/dashboard/guidance`, {
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${FRONTEND_URL}/dashboard/monitoring`, {
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${BACKEND_URL}/`, {
      mustContain: ["NutriSense", "Sign in to your account"],
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${BACKEND_URL}/dashboard`, {
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${BACKEND_URL}/guidance`, {
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    await withProcessGuard(assertPage(`${BACKEND_URL}/monitoring-journal`, {
      mustNotContain: ["Application error", "Unhandled Runtime Error"],
    }), guards);

    console.log("Smoke QA passed for frontend and backend routes.");
  } finally {
    await stopProcess(frontend);
    await stopProcess(backend);
    cleanupPorts([FRONTEND_PORT, BACKEND_PORT]);
  }
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
