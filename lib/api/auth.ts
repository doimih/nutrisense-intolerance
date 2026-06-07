import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/types/user";

const SUPERADMIN_EMAIL = "design@doimih.net";
const SUPERADMIN_PASSWORD = "TempPass123!";

const SESSION_KEY = "ns_session";
const USERS_KEY = "ns_users";
const SESSION_TTL_SECONDS = 3600;

type StoredAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
};

type StoredSession = {
  user: User;
  accessToken: string;
  expiresAt: number;
};

const DEFAULT_SUPERADMIN: StoredAccount = {
  id: "usr_superadmin_001",
  name: "Super Admin",
  email: SUPERADMIN_EMAIL,
  password: SUPERADMIN_PASSWORD,
  mustChangePassword: true,
  createdAt: new Date("2026-06-07T00:00:00Z").toISOString(),
  updatedAt: new Date("2026-06-07T00:00:00Z").toISOString(),
};

function createAccessToken(): string {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `mock_${window.crypto.randomUUID()}`;
  }

  return `mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [DEFAULT_SUPERADMIN];

  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_SUPERADMIN]));
    return [DEFAULT_SUPERADMIN];
  }

  try {
    const parsed = JSON.parse(raw) as StoredAccount[];
    if (!Array.isArray(parsed)) throw new Error("invalid account store");

    const hasSuperadmin = parsed.some(
      (acc) => acc.email.toLowerCase() === SUPERADMIN_EMAIL
    );

    if (hasSuperadmin) return parsed;

    const next = [DEFAULT_SUPERADMIN, ...parsed];
    localStorage.setItem(USERS_KEY, JSON.stringify(next));
    return next;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_SUPERADMIN]));
    return [DEFAULT_SUPERADMIN];
  }
}

function saveAccounts(accounts: StoredAccount[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

function toUser(account: StoredAccount): User {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

function persistSession(user: User, accessToken: string, expiresIn: number): void {
  if (typeof window === "undefined") return;

  const session: StoredSession = {
    user,
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.accessToken || !parsed?.user || !parsed?.expiresAt) return null;

    if (Date.now() >= parsed.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  await delay(800);

  if (!data.email || !data.password) {
    throw new Error("Email și parola sunt obligatorii.");
  }

  if (data.password.length < 6) {
    throw new Error("Parola trebuie să aibă cel puțin 6 caractere.");
  }

  const accounts = loadAccounts();
  const normalizedEmail = data.email.trim().toLowerCase();
  const account = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);

  if (!account || account.password !== data.password) {
    throw new Error("Email sau parola invalida.");
  }

  const user = toUser(account);

  const accessToken = createAccessToken();
  persistSession(user, accessToken, SESSION_TTL_SECONDS);

  return {
    user,
    tokens: {
      accessToken,
      refreshToken: "",
      expiresIn: SESSION_TTL_SECONDS,
    },
  };
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  await delay(1000);

  if (!data.name || !data.email || !data.password) {
    throw new Error("Toate câmpurile sunt obligatorii.");
  }

  if (data.password !== data.confirmPassword) {
    throw new Error("Parolele nu coincid.");
  }

  if (data.password.length < 8) {
    throw new Error("Parola trebuie să aibă cel puțin 8 caractere.");
  }

  if (!data.acceptTerms) {
    throw new Error("Trebuie să accepți Termenii și Politica de Confidențialitate.");
  }

  const accounts = loadAccounts();
  const normalizedEmail = data.email.trim().toLowerCase();
  if (accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)) {
    throw new Error("Exista deja un cont cu acest email.");
  }

  const account: StoredAccount = {
    id: `usr_${Date.now()}`,
    name: data.name,
    email: normalizedEmail,
    password: data.password,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveAccounts([...accounts, account]);

  const user = toUser(account);

  const accessToken = createAccessToken();
  persistSession(user, accessToken, SESSION_TTL_SECONDS);

  return {
    user,
    tokens: {
      accessToken,
      refreshToken: "",
      expiresIn: SESSION_TTL_SECONDS,
    },
  };
}

export async function me(): Promise<User> {
  await delay(300);

  const session = getSession();
  if (session) return session.user;

  throw new Error("Nu ești autentificat.");
}

export async function logout(): Promise<void> {
  await delay(200);

  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAuthenticated(): boolean {
  return !!getSession();
}
