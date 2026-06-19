'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  status?: 'active' | 'suspended';
  createdAt: string;
  plan?: 'free' | 'basic' | 'pro' | 'pro_plus';
  source?: 'admin' | 'platform';
  isVerified?: boolean;
}

type ModalSection = 'details' | 'password' | 'plan' | 'subscription';

const SECTION_LABELS: Record<ModalSection, string> = {
  details: 'Details',
  password: 'Password',
  plan: 'Plan',
  subscription: 'Subscription',
};

export default function UsersSettings() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'all' | 'free' | 'basic' | 'pro' | 'pro_plus'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [section, setSection] = useState<ModalSection>('details');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPlan, setEditPlan] = useState<'free' | 'basic' | 'pro' | 'pro_plus'>('free');
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set('search', search.trim());
      if (planFilter !== 'all') query.set('plan', planFilter);
      const res = await fetch(`/api/superadmin/users?${query.toString()}`);
      const payload = (await res.json()) as { users?: User[]; error?: string };
      if (!res.ok) throw new Error(payload.error || 'Failed to load users.');
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

  const openEdit = (user: User) => {
    setEditUser(user);
    setSection('details');
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
    setEditPlan(user.plan ?? 'free');
    setModalError(null);
    setModalSuccess(null);
  };

  const closeModal = () => {
    setEditUser(null);
    setModalError(null);
    setModalSuccess(null);
  };

  const mutate = async (action: string, extras: Record<string, string> = {}) => {
    if (!editUser) return;
    setModalSaving(true);
    setModalError(null);
    setModalSuccess(null);
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          source: editUser.source,
          action,
          // Always pass email + name so plan-change stubs don't get empty fields
          email: editUser.email,
          name: editUser.name,
          ...extras,
        }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Operation failed.');
      setModalSuccess('Saved successfully.');
      // Refresh user list and update editUser with new plan if applicable
      await loadUsers();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveDetails = () => {
    if (!editName.trim() || !editEmail.trim()) {
      setModalError('Name and email are required.');
      return;
    }
    void mutate('edit', { name: editName.trim(), email: editEmail.trim().toLowerCase() });
  };

  const handleSavePassword = () => {
    if (editPassword.length < 10) {
      setModalError('Password must be at least 10 characters.');
      return;
    }
    void mutate('set-password', { newPassword: editPassword });
  };

  const handleSavePlan = () => {
    void mutate('upgrade', { plan: editPlan });
  };

  const handleResetSubscription = () => {
    void mutate('reset-subscription');
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.email}? This action cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, source: user.source }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Could not delete the user.');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the user.');
    }
  };

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} total &middot; {users.filter((u) => u.source === 'platform').length} platform &middot; {users.filter((u) => u.source !== 'platform').length} admin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">
            {users.filter((u) => u.status === 'active' || u.isVerified).length} active
          </span>
          <span className="badge badge-red">
            {users.filter((u) => u.status === 'suspended').length} suspended
          </span>
        </div>
      </div>

      {/* Search + filter */}
      <input
        className="input-field"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && void loadUsers()}
      />
      <div className="flex items-center gap-2">
        <select
          className="input-field max-w-[220px]"
          aria-label="Filter by plan"
          title="Filter by plan"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="pro_plus">Pro+</option>
        </select>
        <button onClick={() => void loadUsers()} className="btn-primary">
          {loading ? 'Loading…' : 'Reload'}
        </button>
      </div>

      {error && (
        <p className="text-sm rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
          {error}
        </p>
      )}

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((u) => {
          const isPlatform = u.source === 'platform';
          const initials = u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div
              key={u.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">{initials}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-foreground">{u.name}</p>
                    {isPlatform && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium">
                        Platform
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.email} &middot; Joined {new Date(u.createdAt).toLocaleDateString('en-GB')}
                    {isPlatform && (
                      <span className={`ml-2 ${u.isVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        &middot; {u.isVerified ? '✓ Verified' : '⚠ Unverified'}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="badge badge-muted text-xs mr-1">{u.plan ?? '—'}</span>
                <button
                  onClick={() => openEdit(u)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Edit user"
                  aria-label="Edit user"
                >
                  <Pencil size={15} />
                </button>
                <button
                  disabled={u.role === 'superadmin'}
                  onClick={() => void handleDelete(u)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={u.role === 'superadmin' ? 'The superadmin cannot be deleted' : 'Delete user'}
                  aria-label="Delete user"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-8">No users found</p>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-border">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
              <div>
                <p className="text-sm font-semibold text-foreground">{editUser.name}</p>
                <p className="text-xs text-muted-foreground">{editUser.email} &middot; plan: <strong>{editUser.plan ?? 'free'}</strong></p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {(Object.keys(SECTION_LABELS) as ModalSection[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setSection(tab); setModalError(null); setModalSuccess(null); }}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                    section === tab
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  {SECTION_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Modal content */}
            <div className="px-6 py-5 space-y-4 min-h-[200px]">
              {modalError && (
                <p className="text-xs rounded-lg border border-negative/30 bg-negative-bg text-negative px-3 py-2">
                  {modalError}
                </p>
              )}
              {modalSuccess && (
                <p className="text-xs rounded-lg border border-positive/30 bg-positive-bg text-positive px-3 py-2">
                  {modalSuccess}
                </p>
              )}

              {/* ── Details ── */}
              {section === 'details' && (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">Full name</label>
                    <input
                      className="input-field"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="label-text">Email address</label>
                    <input
                      className="input-field"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <button
                    onClick={handleSaveDetails}
                    disabled={modalSaving}
                    className="btn-primary w-full"
                  >
                    {modalSaving ? 'Saving…' : 'Save details'}
                  </button>
                </div>
              )}

              {/* ── Password ── */}
              {section === 'password' && (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">New password</label>
                    <input
                      className="input-field"
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Minimum 10 characters"
                      autoComplete="new-password"
                    />
                    <p className="helper-text">Minimum 10 characters. All active sessions will be invalidated.</p>
                  </div>
                  <button
                    onClick={handleSavePassword}
                    disabled={modalSaving}
                    className="btn-primary w-full"
                  >
                    {modalSaving ? 'Saving…' : 'Change password'}
                  </button>
                </div>
              )}

              {/* ── Plan ── */}
              {section === 'plan' && (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">Selected plan</label>
                    <select
                      className="input-field"
                      aria-label="Selected plan"
                      title="Selected plan"
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as typeof editPlan)}
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="pro_plus">Pro+</option>
                    </select>
                    <p className="helper-text">
                      Current plan: <strong>{editUser.plan ?? 'free'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleSavePlan}
                    disabled={modalSaving || editPlan === (editUser.plan ?? 'free')}
                    className="btn-primary w-full"
                  >
                    {modalSaving ? 'Saving…' : 'Change plan'}
                  </button>
                </div>
              )}

              {/* ── Subscription ── */}
              {section === 'subscription' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20 p-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Reset subscription</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      This action will set the plan to <strong>free</strong> and mark the subscription as expired. It cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSubscription}
                    disabled={modalSaving}
                    className="w-full rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 py-2.5 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
                  >
                    {modalSaving ? 'Processing…' : 'Reset subscription'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
