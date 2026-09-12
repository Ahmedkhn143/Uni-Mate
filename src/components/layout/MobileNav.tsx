'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  HelpCircle, 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  PackageSearch,
  Users,
  ShieldCheck,
  AlertTriangle,
  Radio,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function MobileNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!user || pathname === '/') return null;

  // -------------------------------------------------------------
  // ADMIN MOBILE NAVIGATION
  // -------------------------------------------------------------
  if (isAdmin) {
    return (
      <>
        {/* Admin Action Sheet */}
        {sheetOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Administrator Quick Actions</h3>
                </div>
                <button 
                  onClick={() => setSheetOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <Link
                  href="/admin/reports"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-950/40 text-red-200 hover:bg-red-900/40 transition border border-red-900/40"
                >
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-xs font-bold">Review Moderation Queue</p>
                    <p className="text-[11px] text-slate-400">Inspect flagged questions, posts, and comments</p>
                  </div>
                </Link>

                <Link
                  href="/admin/past-papers"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/40 text-purple-200 hover:bg-purple-900/40 transition border border-purple-900/40"
                >
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs font-bold">Verify Exam Papers</p>
                    <p className="text-[11px] text-slate-400">Approve or reject student past paper uploads</p>
                  </div>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-950/40 text-amber-200 hover:bg-amber-900/40 transition border border-amber-900/40"
                >
                  <Radio className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs font-bold">Broadcast Campus Alert</p>
                    <p className="text-[11px] text-slate-400">Send verified announcement across student feeds</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Sticky Tab Bar for Admin */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 text-slate-400 backdrop-blur-md border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl">
          
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold transition ${
              pathname === '/admin'
                ? 'text-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Console</span>
          </Link>

          <Link
            href="/admin/reports"
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold transition ${
              pathname.startsWith('/admin/reports')
                ? 'text-red-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Moderation</span>
          </Link>

          {/* Center Trigger */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-600/30 active:scale-95 transition-transform"
          >
            <ShieldCheck className="w-6 h-6" />
          </button>

          <Link
            href="/admin/past-papers"
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold transition ${
              pathname.startsWith('/admin/past-papers')
                ? 'text-purple-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Papers</span>
          </Link>

          <Link
            href="/admin/users"
            className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-bold transition ${
              pathname.startsWith('/admin/users')
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Students</span>
          </Link>

        </nav>
      </>
    );
  }

  // -------------------------------------------------------------
  // STUDENT MOBILE NAVIGATION (Default)
  // -------------------------------------------------------------
  return (
    <>
      {/* Mobile Floating Action Sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex flex-col justify-end p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create New Campus Post</h3>
              <button 
                onClick={() => setSheetOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/questions/ask"
                onClick={() => setSheetOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 transition"
              >
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold">Ask an Academic Question</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Get answers from peers and professors</p>
                </div>
              </Link>

              <Link
                href="/lost-and-found/create"
                onClick={() => setSheetOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 transition"
              >
                <PackageSearch className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold">Report Lost or Found Item</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Help reunite campus belongings</p>
                </div>
              </Link>

              <Link
                href="/community?action=new-post"
                onClick={() => setSheetOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 hover:bg-purple-100 transition"
              >
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs font-bold">Share Community Discussion</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Study groups, announcements & tips</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
        
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition ${
            pathname === '/dashboard'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/questions"
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition ${
            pathname.startsWith('/questions')
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span>Q&A</span>
        </Link>

        {/* Center Quick Action Trigger */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <Link
          href="/past-papers"
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition ${
            pathname.startsWith('/past-papers')
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Papers</span>
        </Link>

        <Link
          href="/messages"
          className={`flex flex-col items-center gap-1 p-1.5 text-[10px] font-semibold transition ${
            pathname.startsWith('/messages')
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
        </Link>

      </nav>
    </>
  );
}
