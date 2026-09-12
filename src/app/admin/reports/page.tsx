'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  UserX, 
  Trash2, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Report } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminReportsPage() {
  const { isAdmin, switchUser } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');

  useEffect(() => {
    const load = () => {
      setReports(UniMateStore.getReports());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  if (!isAdmin) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-bold">Admin Privileges Required</h2>
        <button
          onClick={() => switchUser('admin')}
          className="px-5 py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl"
        >
          Switch to Admin Role
        </button>
      </div>
    );
  }

  const handleAction = (reportId: string, action: 'resolved' | 'dismissed', notes?: string) => {
    UniMateStore.resolveReport(reportId, action, notes || `Moderated by admin on ${new Date().toLocaleDateString()}`);
  };

  const filtered = reports.filter(
    (r) => filterStatus === 'all' || r.status === filterStatus
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Suite
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Content Moderation Queue
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review flagged student submissions, spam reports, and enforce university community guidelines.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'pending' ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Pending ({reports.filter((r) => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'resolved' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilterStatus('dismissed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterStatus === 'dismissed' ? 'bg-white dark:bg-slate-900 text-slate-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Dismissed
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Queue is completely clear!"
          description="There are no reports matching this filter. Good work maintaining a healthy campus community."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => (
            <div
              key={report.id}
              className={`p-6 rounded-3xl border transition shadow-sm space-y-4 ${
                report.status === 'pending'
                  ? 'bg-white dark:bg-slate-900 border-red-200/80 dark:border-red-950/60 ring-1 ring-red-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {report.item_title || `${report.item_type.toUpperCase()} #${report.item_id}`}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 uppercase">
                      {report.reason.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      • {report.item_type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Report details: </span>
                    {report.details}
                  </p>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <span>Reported by {report.reporter_name}</span>
                  <span className="block">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  {report.status === 'pending' ? (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Action required
                    </span>
                  ) : report.status === 'resolved' ? (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Action taken ({report.admin_notes})
                    </span>
                  ) : (
                    <span className="text-slate-400">Dismissed as false report</span>
                  )}
                </div>

                {report.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(report.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 transition"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleAction(report.id, 'resolved', 'Flagged content removed')}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition shadow-xs"
                    >
                      Resolve & Remove Content
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
