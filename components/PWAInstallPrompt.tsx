'use client';
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __pwaInstallEvent: BeforeInstallPromptEvent | null;
  }
}

type Platform = 'ios' | 'android';

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return null;
}

function isStandaloneMode(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

function isSafariBrowser(): boolean {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isStandaloneMode()) return;
    if (sessionStorage.getItem('pwa_dismissed') === '1') return;

    const p = detectPlatform();
    if (!p) return;

    if (p === 'android') {
      // Event captured globally before React mounted (see layout.tsx script)
      if (window.__pwaInstallEvent) {
        promptRef.current = window.__pwaInstallEvent;
        window.__pwaInstallEvent = null;
        setPlatform('android');
        const t = window.setTimeout(() => setShow(true), 10000);
        return () => window.clearTimeout(t);
      }

      // Fallback: event fires after component mounts
      const handler = (e: Event) => {
        e.preventDefault();
        promptRef.current = e as unknown as BeforeInstallPromptEvent;
        setPlatform('android');
        window.setTimeout(() => setShow(true), 10000);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }

    if (p === 'ios' && isSafariBrowser()) {
      setPlatform('ios');
      const t = window.setTimeout(() => setShow(true), 10000);
      return () => window.clearTimeout(t);
    }
  }, []);

  const handleInstall = async () => {
    if (!promptRef.current) return;
    try {
      promptRef.current.prompt();
      await promptRef.current.userChoice;
    } finally {
      promptRef.current = null;
      setShow(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_dismissed', '1');
    setShow(false);
  };

  if (!show || !platform || pathname.startsWith('/auth')) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-green-500 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Instalează NutriAID</p>
            <p className="text-white/75 text-xs mt-0.5 truncate">Acces rapid, fără browser</p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Închide"
            className="text-white/70 hover:text-white transition-colors flex-shrink-0 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">

          {/* Android */}
          {platform === 'android' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                Adaugă NutriAID pe ecranul principal pentru acces instant, ca o aplicație nativă.
              </p>
              <button
                onClick={() => void handleInstall()}
                className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Instalează aplicația
              </button>
              <button
                onClick={handleDismiss}
                className="w-full mt-2 text-gray-500 dark:text-gray-400 text-sm py-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Nu acum
              </button>
            </>
          )}

          {/* iOS Safari */}
          {platform === 'ios' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                Instalează NutriAID pe iPhone în 2 pași simpli:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-700 dark:text-green-400 text-xs font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Apasă butonul{' '}
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 mx-0.5 align-middle">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </span>{' '}
                      Share
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Butonul din bara de jos a Safari-ului
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-700 dark:text-green-400 text-xs font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Alege &quot;Add to Home Screen&quot;
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Derulează în jos în meniu și apasă{' '}
                      <strong className="text-gray-700 dark:text-gray-300">Adaugă pe ecranul principal</strong>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Am înțeles
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
