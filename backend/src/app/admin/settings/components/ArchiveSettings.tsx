'use client';
import React, { useCallback, useEffect, useState } from 'react';

type ArchiveLinkEntry = {
  id: string;
  sentToEmail: string;
  generatedBy: string;
  expiresAt: string;
  downloadedAt: string | null;
  createdAt: string;
  expired: boolean;
};

export default function ArchiveSettings() {
  const [email, setEmail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; downloadUrl?: string; expiresAt?: string } | null>(null);
  const [links, setLinks] = useState<ArchiveLinkEntry[]>([]);
  const [linksError, setLinksError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadLinks = useCallback(() => {
    setLinksError(false);
    fetch('/api/superadmin/archive/links')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { links?: ArchiveLinkEntry[] }) => setLinks(data.links ?? []))
      .catch(() => setLinksError(true));
  }, []);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const handleGenerate = async () => {
    if (!email.trim()) return;
    setGenerating(true);
    setResult(null);
    const res = await fetch('/api/superadmin/archive/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    }).catch(() => null);
    setGenerating(false);
    if (!res) {
      setResult({ ok: false, message: 'Cererea a esuat. Verifica conexiunea.' });
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; downloadUrl?: string; expiresAt?: string };
    setResult({ ok: res.ok && data.ok !== false, message: data.message || (res.ok ? 'Link generat.' : 'Eroare.'), downloadUrl: data.downloadUrl, expiresAt: data.expiresAt });
    if (res.ok && data.ok !== false) {
      setEmail('');
      setTimeout(loadLinks, 300);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url).catch(() => null);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Generator */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h2 className="section-header">Generator Link Arhiva</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Genereaza un link securizat pentru descarcarea arhivei platformei. Link-ul este valabil <strong>12 ore</strong>.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 space-y-1">
          <p className="font-medium">Ce contine arhiva?</p>
          <p>• Lista utilizatori (fara parole sau date sensibile)</p>
          <p>• Subscriptii si plati</p>
          <p>• Ultimele 500 evenimente de audit</p>
          <p>• Setari platforma (fara chei secrete)</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-text" htmlFor="archive-email">Email destinatar</label>
            <input
              id="archive-email"
              className="input-field"
              type="email"
              placeholder="email@exemplu.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleGenerate(); }}
              disabled={generating}
            />
            <p className="helper-text">Link-ul arhivei va fi trimis la aceasta adresa de email.</p>
          </div>

          <button
            onClick={() => void handleGenerate()}
            disabled={generating || !email.trim()}
            className="btn-primary"
          >
            {generating ? 'Se genereaza…' : 'Genereaza si trimite link'}
          </button>
        </div>

        {result && (
          <div className={`rounded-lg p-3 space-y-2 text-sm font-medium ${result.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            <div className="flex items-center gap-2">
              <span>{result.ok ? '✓' : '✗'}</span>
              <span>{result.message}</span>
            </div>
            {result.ok && result.downloadUrl && (
              <div className="flex items-center gap-2 pt-1">
                <code className="text-xs bg-white border border-green-200 rounded px-2 py-1 flex-1 truncate">
                  {result.downloadUrl}
                </code>
                <button
                  onClick={() => void handleCopy(result.downloadUrl!)}
                  className="text-xs px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors flex-shrink-0"
                >
                  {copied === result.downloadUrl ? '✓ Copiat' : 'Copiaza'}
                </button>
              </div>
            )}
            {result.ok && result.expiresAt && (
              <p className="text-xs text-green-700 font-normal">
                Expira la: {new Date(result.expiresAt).toLocaleString('ro-RO')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Istoric Link-uri Generate</h3>
          <button
            onClick={loadLinks}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Reincarca"
          >
            ↻ Reincarca
          </button>
        </div>

        {linksError ? (
          <p className="text-sm text-negative text-center py-6">
            Nu s-au putut incarca link-urile. Apasa ↻ Reincarca.
          </p>
        ) : links.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nu exista link-uri generate inca.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Trimis la</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Generat de</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Expira la</th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">Status</th>
                  <th className="pb-2 font-medium text-muted-foreground">Descarcat la</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-foreground">{link.sentToEmail}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs">{link.generatedBy}</td>
                    <td className="py-2 pr-4 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(link.expiresAt).toLocaleString('ro-RO', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 pr-4">
                      {link.expired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Expirat
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Activ
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">
                      {link.downloadedAt
                        ? new Date(link.downloadedAt).toLocaleString('ro-RO', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
