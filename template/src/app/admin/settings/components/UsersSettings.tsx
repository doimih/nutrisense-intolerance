'use client';
import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  joined: string;
  intolerances: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'Sofia Chen', email: 'sofia@example.com', role: 'admin', status: 'active', joined: '2026-01-15', intolerances: 3 },
  { id: '2', name: 'Andrei Popescu', email: 'andrei@example.com', role: 'user', status: 'active', joined: '2026-02-20', intolerances: 2 },
  { id: '3', name: 'Maria Ionescu', email: 'maria@example.com', role: 'user', status: 'active', joined: '2026-03-10', intolerances: 5 },
  { id: '4', name: 'Radu Dumitrescu', email: 'radu@example.com', role: 'user', status: 'suspended', joined: '2026-04-05', intolerances: 1 },
  { id: '5', name: 'Elena Stanescu', email: 'elena@example.com', role: 'user', status: 'active', joined: '2026-05-18', intolerances: 4 },
];

export default function UsersSettings() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const toggleRole = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
  };

  return (
    <div className="card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-header">User Management</h2>
          <p className="text-sm text-muted-foreground mt-1">{users.length} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-green">{users.filter(u => u.status === 'active').length} active</span>
          <span className="badge badge-red">{users.filter(u => u.status === 'suspended').length} suspended</span>
        </div>
      </div>

      <input
        className="input-field"
        placeholder="Search by name or email…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold">{u.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email} · Joined {u.joined}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-muted text-xs">{u.intolerances} intolerances</span>
              <button
                onClick={() => toggleRole(u.id)}
                className={`badge cursor-pointer transition-colors ${u.role === 'admin' ? 'badge-blue' : 'badge-muted'}`}
              >
                {u.role}
              </button>
              <button
                onClick={() => toggleStatus(u.id)}
                className={`badge cursor-pointer transition-colors ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}
              >
                {u.status}
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
