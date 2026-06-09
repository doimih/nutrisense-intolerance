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
  details: 'Detalii',
  password: 'Parola',
  plan: 'Plan',
  subscription: 'Abonament',
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
      if (!res.ok) throw new Error(payload.error || 'Operatiunea a esuat.');
      setModalSuccess('Salvat cu succes.');
      // Refresh user list and update editUser with new plan if applicable
      await loadUsers();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Operatiunea a esuat.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleSaveDetails = () => {
    if (!editName.trim() || !editEmail.trim()) {
      setModalError('Numele si emailul sunt obligatorii.');
      return;
    }
    void mutate('edit', { name: editName.trim(), email: editEmail.trim().toLowerCase() });
  };

  const handleSavePassword = () => {
    if (editPassword.length < 10) {
      setModalError('Parola trebuie sa aiba minim 10 caractere.');
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
    if (!window.confirm(`Sterge userul ${user.email}? Actiunea este ireversibila.`)) return;
    setError(null);
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, source: user.source }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Nu s-a putut sterge userul.');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a putut sterge userul.');
    }
  };

  return (
    <div className="card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header">Gestionare Useri</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} total &middot; {users.filter((u) => u.source === 'platform').length} platform &middot; {users.filter((u) => u.source !== 'platform').length} admin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">
            {users.filter((u) => u.status === 'active' || u.isVerified).length} activi
          </span>
          <span className="badge badge-red">
            {users.filter((u) => u.status === 'suspended').length} suspendati
          </span>
        </div>
      </div>

      {/* Search + filter */}
      <input
        className="input-field"
        placeholder="Cauta dupa nume sau email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && void loadUsers()}
      />
      <div className="flex items-center gap-2">
        <select
          className="input-field max-w-[220px]"
          aria-label="Filtreaza dupa plan"
          title="Filtreaza dupa plan"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value as typeof planFilter)}
        >
          <option value="all">Toate planurile</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="pro_plus">Pro+</option>
        </select>
        <button onClick={() => void loadUsers()} className="btn-primary">
          {loading ? 'Se incarca…' : 'Reincarca'}
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
                    {u.email} &middot; Joined {new Date(u.createdAt).toLocaleDateString('ro-RO')}
                    {isPlatform && (
                      <span className={`ml-2 ${u.isVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        &middot; {u.isVerified ? '✓ Verificat' : '⚠ Neverificat'}
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
                  title="Editeaza userul"
                  aria-label="Editeaza userul"
                >
                  <Pencil size={15} />
                </button>
                <button
                  disabled={u.role === 'superadmin'}
                  onClick={() => void handleDelete(u)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={u.role === 'superadmin' ? 'Superadminul nu poate fi sters' : 'Sterge userul'}
                  aria-label="Sterge userul"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && !loading && (
          <p className="text-center text-sm text-muted-foreground py-8">Nu exista useri</p>
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
                aria-label="Inchide"
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

              {/* ── Detalii ── */}
              {section === 'details' && (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">Nume complet</label>
                    <input
                      className="input-field"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Nume complet"
                    />
                  </div>
                  <div>
                    <label className="label-text">Adresa de email</label>
                    <input
                      className="input-field"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="email@exemplu.ro"
                    />
                  </div>
                  <button
                    onClick={handleSaveDetails}
                    disabled={modalSaving}
                    className="btn-primary w-full"
                  >
                    {modalSaving ? 'Se salveaza…' : 'Salveaza detaliile'}
                  </button>
                </div>
              )}

              {/* ── Parola ── */}
              {section === 'password' && (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">Parola noua</label>
                    <input
                      className="input-field"
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Minim 10 caractere"
                      autoComplete="new-password"
                    />
                    <p className="helper-text">Minim 10 caractere. Toate sesiunile active vor fi invalidate.</p>
                  </div>
                  <button
                    onClick={handleSavePassword}
                    disabled={modalSaving}
                    className="btn-primary w-full"
                  >
                    {modalSaving ? 'Se salveaza…' : 'Schimba parola'}
                  </button>
                </div>
              )}

              {/* ── Plan ── */}
              {section === 'plan' && (
                <div className="space-y-3">
                  <div>
                    <label className="label-text">Plan ales</label>
                    <select
                      className="input-field"
                      aria-label="Plan ales"
                      title="Plan ales"
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as typeof editPlan)}
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="pro_plus">Pro+</option>
                    </select>
                    <p className="helper-text">
                      Plan curent: <strong>{editUser.plan ?? 'free'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleSavePlan}
                    disabled={modalSaving || editPlan === (editUser.plan ?? 'free')}
                    className="btn-primary w-full"
                  >
                    {modalSaving ? 'Se salveaza…' : 'Schimba planul'}
                  </button>
                </div>
              )}

              {/* ── Abonament ── */}
              {section === 'subscription' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20 p-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Reset abonament</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Aceasta actiune va seta planul la <strong>free</strong> si va marca abonamentul ca expirat. Nu poate fi anulata.
                    </p>
                  </div>
                  <button
                    onClick={handleResetSubscription}
                    disabled={modalSaving}
                    className="w-full rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 py-2.5 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
                  >
                    {modalSaving ? 'Se proceseaza…' : 'Reseteaza abonamentul'}
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
