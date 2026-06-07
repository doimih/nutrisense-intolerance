'use client';
import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function DangerZone() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    // BACKEND INTEGRATION: DELETE /account — permanently removes user data
    await new Promise((r) => setTimeout(r, 1500));
    setDeleting(false);
    setConfirmOpen(false);
    toast?.error('Account deleted. Redirecting…');
    setTimeout(() => { window.location.href = '/'; }, 2000);
  };

  return (
    <>
      <div className="card p-6 border-negative/30">
        <h2 className="section-header text-negative mb-1">Danger Zone</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Permanent actions that cannot be undone. Proceed with caution.
        </p>

        <div className="flex items-start justify-between p-4 rounded-xl border border-negative/20 bg-negative-bg/30">
          <div>
            <p className="text-sm font-semibold text-foreground">Delete account</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Permanently delete your account and all associated data including journal entries, guidance history, and intolerance records.
            </p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="btn-danger ml-4 flex-shrink-0 text-sm"
          >
            Delete Account
          </button>
        </div>
      </div>
      <Modal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setConfirmText(''); }}
        title="Delete your account permanently?"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setConfirmOpen(false); setConfirmText(''); }}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || deleting}
              className="btn-danger"
            >
              {deleting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deleting…
                </>
              ) : (
                'Yes, delete everything'
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-negative-bg border border-negative/20">
            <svg className="w-5 h-5 text-negative flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-negative">This cannot be undone</p>
              <p className="text-xs text-muted-foreground mt-1">
                All journal entries, guidance history, and intolerance data will be permanently deleted.
              </p>
            </div>
          </div>
          <div>
            <label className="label-text" htmlFor="delete-confirm">
              Type <span className="font-mono font-bold text-negative">DELETE</span> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              className={`input-field mt-1.5 ${confirmText === 'DELETE' ? 'border-negative' : ''}`}
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e?.target?.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}