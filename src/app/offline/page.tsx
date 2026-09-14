'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, BookOpen, Bookmark, GraduationCap } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Offline Badge & Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Offline Campus Mode</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            No Internet Connection
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You are browsing UniMate in offline mode. Any previously opened exam papers, coursework questions, and saved bookmarks are still accessible on your device.
          </p>
        </div>

        {/* Quick Access to Cached Sections */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition group"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/bookmarks"
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition group"
          >
            <Bookmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Saved Items</span>
          </Link>
        </div>

        {/* Reconnect Button */}
        <div className="pt-2">
          <button
            onClick={handleReload}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Connection & Retry</span>
          </button>
        </div>

      </div>
    </div>
  );
}
