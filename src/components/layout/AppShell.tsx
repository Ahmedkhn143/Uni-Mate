'use client';

import React, { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Pages where navbar, footer, and sidebar must not appear
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isLandingPage = pathname === '/';
  const isPublicPage = isAuthPage || isLandingPage;

  // Enforce Student Privacy Wall on all internal campus routes
  useEffect(() => {
    if (!isLoading && !user && !isPublicPage) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, isPublicPage, pathname, router]);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  // If visiting an internal campus route without login, block content rendering until redirect completes
  if (!isPublicPage && !user) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Verifying student credentials...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Private Campus Portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Student discussions, resources, and lost & found archives are strictly private. You must sign in with your verified <strong className="text-slate-800 dark:text-slate-200">@kfueit.edu.pk</strong> student account to view this page.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              Sign In as Student
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
            >
              Verify University Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shouldShowSidebar = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {shouldShowSidebar && <Sidebar />}

        <main className={`flex-1 min-w-0 ${shouldShowSidebar ? 'px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12' : (isLandingPage ? 'w-full' : 'w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12')}`}>
          {children}
        </main>
      </div>

      <MobileNav />
      {(!user || isLandingPage) && <Footer />}
    </div>
  );
}
