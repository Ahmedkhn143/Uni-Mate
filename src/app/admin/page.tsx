'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  HelpCircle, 
  FileText, 
  PackageSearch, 
  Award, 
  AlertTriangle, 
  Settings, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Report } from '@/types/database';

export default function AdminDashboardPage() {
  const { user, isAdmin, switchUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const load = () => {
      setStats(UniMateStore.getStats());
      setReports(UniMateStore.getReports().slice(0, 5));
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  if (!isAdmin) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The Admin Suite is reserved for verified university faculty and moderation staff.
        </p>
        <button
          onClick={() => switchUser('admin')}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition"
        >
          Switch to Admin Role (Demo)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Campus Administration Portal
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Moderator Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Oversee community moderation, academic resource approvals, and student safety.
          </p>
        </div>

        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Moderation Queue ({stats?.pendingReports || 0})</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
              <span className="text-[11px] font-bold text-slate-400">Total</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalStudents}</div>
            <div className="text-xs text-slate-500 font-medium">Enrolled Students</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
              <span className="text-[11px] font-bold text-slate-400">{stats.totalAnswers} answers</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.activeQuestions}</div>
            <div className="text-xs text-slate-500 font-medium">Academic Questions</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <FileText className="w-5 h-5" />
              <span className="text-[11px] font-bold text-amber-600">{stats.pendingPapers} pending</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.pastPapersCount}</div>
            <div className="text-xs text-slate-500 font-medium">Verified Exam Papers</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <PackageSearch className="w-5 h-5" />
              <span className="text-[11px] font-bold text-slate-400">{stats.foundItems} found</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.lostItems}</div>
            <div className="text-xs text-slate-500 font-medium">Lost Items Reported</div>
          </div>
        </div>
      )}

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <Link
          href="/admin/reports"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-red-500/50 hover:shadow-md transition space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Moderation Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review flagged posts, comments, scam alerts, and take disciplinary actions.
            </p>
          </div>
          <div className="text-xs font-bold text-red-600 flex items-center gap-1">
            Open Queue →
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Student Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage student accounts, adjust roles, and enforce suspension where necessary.
            </p>
          </div>
          <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
            Manage Students →
          </div>
        </Link>

        <Link
          href="/admin/past-papers"
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-md transition space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Paper Moderation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Approve or reject student-submitted past examination PDFs.
            </p>
          </div>
          <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
            Review Uploads →
          </div>
        </Link>

      </div>

      {/* Recent Flagged Reports Snippet */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Campus Reports</h3>
          </div>
          <Link href="/admin/reports" className="text-xs font-bold text-indigo-600 hover:underline">
            All Reports ({reports.length}) →
          </Link>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No reports currently in moderation queue.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{r.item_title || r.item_type}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 uppercase">
                      {r.reason.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{r.details}</p>
                </div>
                <Link
                  href="/admin/reports"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 text-xs"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
