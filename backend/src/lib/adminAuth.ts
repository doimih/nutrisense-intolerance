export const ADMIN_USERS_KEY = 'ns_admin_users';
export const ADMIN_SESSION_KEY = 'ns_admin_session';
export const SUPERADMIN_EMAIL = 'design@doimih.net';
export const SUPERADMIN_PASSWORD = 'TempPass123!';

export interface StoredAdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
  role: string;
  loggedInAt: string;
}

const DEFAULT_SUPERADMIN: StoredAdminUser = {
  id: 'adm_superadmin_001',
  name: 'Super Admin',
  email: SUPERADMIN_EMAIL,
  password: SUPERADMIN_PASSWORD,
  mustChangePassword: true,
  createdAt: new Date('2026-06-07T00:00:00Z').toISOString(),
  updatedAt: new Date('2026-06-07T00:00:00Z').toISOString(),
};

export function loadAdminUsers(): StoredAdminUser[] {
  if (typeof window === 'undefined') return [DEFAULT_SUPERADMIN];

  const raw = localStorage.getItem(ADMIN_USERS_KEY);
  if (!raw) {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify([DEFAULT_SUPERADMIN]));
    return [DEFAULT_SUPERADMIN];
  }

  try {
    const parsed = JSON.parse(raw) as StoredAdminUser[];
    if (!Array.isArray(parsed)) throw new Error('invalid user store');

    const hasSuperadmin = parsed.some((u) => u.email.toLowerCase() === SUPERADMIN_EMAIL);
    if (hasSuperadmin) return parsed;

    const next = [DEFAULT_SUPERADMIN, ...parsed];
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
  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({
      userId: user.id,
      name: user.name,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
      role: 'superadmin',
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

    return parsed;
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
