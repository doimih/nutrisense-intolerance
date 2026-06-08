'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  KeyRound,
  Pencil,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export default function UsersSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'pro' | 'enterprise'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set('search', search.trim());
      if (planFilter !== 'all') query.set('plan', planFilter);
      const response = await fetch(`/api/superadmin/users?${query.toString()}`);
      const payload = (await response.json()) as { users?: User[]; error?: string };
      if (!response.ok) throw new Error(payload.error || 'Failed to load users.');
      setUsers(payload.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planFilter]);

  const filtered = useMemo(() => users, [users]);

  const mutateUser = async (
    id: string,
    action:
      | 'deactivate'
      | 'activate'
      | 'reset-subscription'
      | 'upgrade'
      | 'downgrade'
      | 'edit'
      | 'set-password',
    plan?: 'free' | 'pro' | 'enterprise',
    extras?: { name?: string; email?: string; newPassword?: string }
  ) => {
    setError(null);
    const response = await fetch('/api/superadmin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id, action, plan, ...extras }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(payload.error || 'User update failed.');
    await loadUsers();
  };

  const handleEdit = async (user: User) => {
    const nextName = window.prompt('New name', user.name)?.trim() || '';
    if (!nextName) return;
    const nextEmail = window.prompt('New email', user.email)?.trim().toLowerCase() || '';
    if (!nextEmail) return;

    try {
      await mutateUser(user.id, 'edit', undefined, { name: nextName, email: nextEmail });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not edit user.');
    }
  };

  const handlePasswordReset = async (user: User) => {
    const password = window.prompt('Set a new password (min 10 chars)') || '';
    if (!password) return;

    try {
      await mutateUser(user.id, 'set-password', undefined, { newPassword: password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set password.');
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.email}? This action cannot be undone.`)) return;

    setError(null);
    try {
      const response = await fetch('/api/superadmin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Could not delete user.');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete user.');
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">{users.length} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">
            {users.filter((u) => u.status === 'active').length} active
          </span>
          <span className="badge badge-red">
            {users.filter((u) => u.status === 'suspended').length} suspended
          </span>
        </div>
      </div>

      <input
        className="input-field"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <select
          className="input-field max-w-[220px]"
          aria-label="Filter users by plan"
          title="Filter users by plan"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <button onClick={() => void loadUsers()} className="btn-primary">
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-2">
        {error && (
          <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
            {error}
          </p>
        )}
        {filtered.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold">
                  {u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">
                  {u.email} · Joined {new Date(u.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-muted text-xs">{u.plan}</span>
              <button
                onClick={() =>
                  void mutateUser(
                    u.id,
                    u.plan === 'enterprise' ? 'downgrade' : 'upgrade',
                    u.plan === 'enterprise' ? 'pro' : 'enterprise'
                  )
                }
                className="badge cursor-pointer transition-colors badge-blue"
                title={u.plan === 'enterprise' ? 'Downgrade plan' : 'Upgrade plan'}
              >
                {u.plan === 'enterprise' ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
              </button>
              <button
                onClick={() =>
                  void mutateUser(u.id, u.status === 'active' ? 'deactivate' : 'activate')
                }
                className={`badge cursor-pointer transition-colors ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}
                title={u.status === 'active' ? 'Deactivate user' : 'Activate user'}
              >
                {u.status === 'active' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
              </button>
              <button
                onClick={() => void mutateUser(u.id, 'reset-subscription')}
                className="badge cursor-pointer transition-colors badge-muted"
                title="Reset subscription"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => void handleEdit(u)}
                className="badge cursor-pointer transition-colors badge-blue"
                title="Edit user"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => void handlePasswordReset(u)}
                className="badge cursor-pointer transition-colors badge-amber"
                title="Set password"
              >
                <KeyRound size={14} />
              </button>
              <button
                disabled={u.role === 'superadmin'}
                onClick={() => void handleDelete(u)}
                className="badge cursor-pointer transition-colors badge-red disabled:opacity-50 disabled:cursor-not-allowed"
                title={u.role === 'superadmin' ? 'Superadmin cannot be deleted' : 'Delete user'}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
        )}
      </div>
    </div>
  );
}
