'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wifi, WifiOff, Download, X, CheckCircle2 } from 'lucide-react';

interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  installPWA: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
  isOnline: true,
  isInstallable: false,
  installPWA: async () => {},
});

export function PWAProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial Online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBannerDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[UniMate PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[UniMate PWA] Service Worker registration failed:', err);
        });
    } else if ('serviceWorker' in navigator) {
      // In development mode, register as well for offline testing
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {});
    }

    // 3. Listen to beforeinstallprompt event (Chrome / Edge / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      alert('To install UniMate: On Chrome, click the 3 dots menu and select "Install UniMate". On iPhone/Safari, tap Share and "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <PWAContext.Provider value={{ isOnline, isInstallable, installPWA }}>
      {children}

      {/* Floating Offline Notification Banner */}
      {!isOnline && !bannerDismissed && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/95 dark:bg-amber-600/95 text-white shadow-2xl backdrop-blur-md border border-amber-400/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold leading-snug">Working in Offline Mode</p>
                <p className="text-[10px] text-amber-100">Cached papers & saved items remain available</p>
              </div>
            </div>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Reconnected Back Online Toast */}
      {showOnlineToast && (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-sm mx-auto z-50 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-600/95 text-white shadow-xl backdrop-blur-md border border-emerald-400/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <div>
              <p className="text-xs font-bold">Back Online</p>
              <p className="text-[10px] text-emerald-100">Campus connection restored</p>
            </div>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  return useContext(PWAContext);
}
