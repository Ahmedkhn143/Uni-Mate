'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { useAuth } from '@/lib/auth-context';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Pages where sidebar should not appear (public or auth pages)
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  const isLandingPage = pathname === '/';
  const shouldShowSidebar = user && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {shouldShowSidebar && <Sidebar />}

        <main className={`flex-1 min-w-0 ${shouldShowSidebar ? 'px-4 sm:px-8 py-6 pb-24 md:pb-12' : 'w-full'}`}>
          {children}
        </main>
      </div>

      <MobileNav />
      {(!user || isLandingPage) && <Footer />}
    </div>
  );
}
