'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn, Lock, Key } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function AdminAccessDenied() {
  const { user, logout } = useAuth();

  return (
    <div className="py-16 px-4 max-w-xl mx-auto text-center space-y-6">
      
      {/* Shield Icon */}
      <div className="relative mx-auto w-20 h-20 rounded-3xl bg-red-500/10 dark:bg-red-950/40 border-2 border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-xl shadow-red-500/10">
        <ShieldAlert className="w-10 h-10" />
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
          !
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[11px] font-extrabold uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          HTTP 403 • Administrator Access Restricted
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Campus Administration Clearance Required
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          The Campus Administration Console is strictly restricted to verified university deans, faculty staff, and moderation personnel.
        </p>
      </div>

      {/* Active User Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Current Active Session
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {user?.full_name || 'Guest User'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email || 'Not authenticated'} • <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase">{user?.role || 'Student'} Role</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Student Clearance
          </span>
        </div>
      </div>

      {/* Faculty Clearance Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 text-left space-y-1.5">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <Key className="w-4 h-4 text-amber-600 shrink-0" />
          <span>University Administrative Clearance Required</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Access to this console requires verified university faculty or dean authorization on the official <strong className="font-mono text-amber-700 dark:text-amber-300">@kfueit.edu.pk</strong> campus domain.
        </p>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Student Dashboard
        </Link>
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md transition"
        >
          <LogIn className="w-4 h-4" />
          Sign In as Administrator
        </button>
      </div>

    </div>
  );
}
