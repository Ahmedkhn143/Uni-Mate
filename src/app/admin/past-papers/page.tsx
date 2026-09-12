'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, XCircle, Download, Eye, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { PastPaper } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

import { AdminAccessDenied } from '@/components/ui/AdminAccessDenied';

export default function AdminPastPapersPage() {
  const { isAdmin } = useAuth();
  const [papers, setPapers] = useState<PastPaper[]>([]);

  useEffect(() => {
    const load = () => {
      setPapers(UniMateStore.getPastPapers());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  const handleSetStatus = (paperId: string, status: 'approved' | 'rejected') => {
    UniMateStore.setPastPaperStatus(paperId, status);
  };

  const pendingPapers = papers.filter((p) => p.status === 'pending');
  const approvedPapers = papers.filter((p) => p.status === 'approved');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Suite
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Past Paper Verification & Moderation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Verify that student-uploaded exam papers are genuine and high quality before releasing them to the campus library.
        </p>
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> Pending Approval ({pendingPapers.length})
        </h2>

        {pendingPapers.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 bg-white dark:bg-slate-900">
            No pending exam papers waiting for moderation.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPapers.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {p.subject_code}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.title}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Uploaded by <span className="font-semibold">{p.uploader_name}</span> • Year {p.year} {p.exam_type.toUpperCase()} • {p.file_size_kb} KB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={p.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> Preview
                  </a>
                  <button
                    onClick={() => handleSetStatus(p.id, 'rejected')}
                    className="px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 font-bold text-xs"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleSetStatus(p.id, 'approved')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Approve Paper
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Papers Quick View */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Published Papers in Library ({approvedPapers.length})
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {approvedPapers.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">{p.subject_code}:</span>
                <span className="text-slate-600 dark:text-slate-300">{p.title}</span>
                <span className="text-[10px] text-slate-400 ml-2">({p.downloads} downloads)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                Approved
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
