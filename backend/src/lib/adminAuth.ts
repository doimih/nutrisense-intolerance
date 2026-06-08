export const ADMIN_USERS_KEY = 'ns_admin_users';
export const ADMIN_SESSION_KEY = 'ns_admin_session';
export const SUPERADMIN_EMAIL = 'design@doimih.net';
export const SUPERADMIN_PASSWORD = 'PassTemp123!';

export interface StoredAdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'user';
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
  role: 'superadmin' | 'admin' | 'user';
  loggedInAt: string;
}

const DEFAULT_SUPERADMIN: StoredAdminUser = {
  id: 'adm_superadmin_001',
  name: 'Super Admin',
  email: SUPERADMIN_EMAIL,
  password: SUPERADMIN_PASSWORD,
  role: 'superadmin',
  mustChangePassword: false,
  createdAt: new Date('2026-06-07T00:00:00Z').toISOString(),
  updatedAt: new Date('2026-06-07T00:00:00Z').toISOString(),
};

function resolveRole(
  user: Pick<StoredAdminUser, 'email'> & { role?: StoredAdminUser['role'] }
): StoredAdminUser['role'] {
  if (user.email.toLowerCase() === SUPERADMIN_EMAIL) return 'superadmin';
  return user.role ?? 'user';
}

export function loadAdminUsers(): StoredAdminUser[] {
  if (typeof window === 'undefined') return [DEFAULT_SUPERADMIN];

  const raw = localStorage.getItem(ADMIN_USERS_KEY);
  if (!raw) {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify([DEFAULT_SUPERADMIN]));
    return [DEFAULT_SUPERADMIN];
  }

  try {
    const parsed = JSON.parse(raw) as Array<
      Omit<StoredAdminUser, 'role'> & { role?: StoredAdminUser['role'] }
    >;
    if (!Array.isArray(parsed)) throw new Error('invalid user store');

    const normalized = parsed.map((u) => ({
      ...u,
      role: resolveRole(u),
    }));

    const superadminIndex = normalized.findIndex((u) => u.email.toLowerCase() === SUPERADMIN_EMAIL);
    const next = [...normalized];

    if (superadminIndex === -1) {
      next.unshift(DEFAULT_SUPERADMIN);
    } else {
      const existing = next[superadminIndex];
      next[superadminIndex] = {
        ...existing,
        id: DEFAULT_SUPERADMIN.id,
        name: DEFAULT_SUPERADMIN.name,
        email: DEFAULT_SUPERADMIN.email,
        password: DEFAULT_SUPERADMIN.password,
        role: 'superadmin',
        mustChangePassword: false,
        updatedAt: new Date().toISOString(),
      };
    }

    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(next));
    return next;
  } catch {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify([DEFAULT_SUPERADMIN]));
    return [DEFAULT_SUPERADMIN];
  }
}

export function saveAdminUsers(users: StoredAdminUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

export function persistAdminSession(user: StoredAdminUser): void {
  if (typeof window === 'undefined') return;
  const role = resolveRole(user);
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
      role,
      loggedInAt: new Date().toISOString(),
    } satisfies AdminSession)
  );
}

export function loadAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.userId || !parsed?.email || !parsed?.name) {
      return null;
    }
    const next: AdminSession = {
      ...parsed,
      role: resolveRole({ email: parsed.email, role: parsed.role }),
    };

    if (next.role !== parsed.role) {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
    }

    return next;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function updateAdminPassword(userId: string, newPassword: string): StoredAdminUser | null {
  const users = loadAdminUsers();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex < 0) return null;

  const updatedUser: StoredAdminUser = {
    ...users[userIndex],
    password: newPassword,
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = [...users];
  nextUsers[userIndex] = updatedUser;
  saveAdminUsers(nextUsers);

  return updatedUser;
}
