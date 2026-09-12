'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowRight, HelpCircle, FileText, Award, PackageSearch, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Bookmark as BookmarkType } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'question' | 'paper' | 'scholarship' | 'lost_found'>('all');

  useEffect(() => {
    if (!user) return;
    const load = () => {
      setBookmarks(UniMateStore.getBookmarks(user.id));
    };
    load();
    return UniMateStore.subscribe(load);
  }, [user]);

  const handleRemove = (bm: BookmarkType) => {
    if (!user) return;
    UniMateStore.toggleBookmark({
      user_id: user.id,
      item_type: bm.item_type,
      item_id: bm.item_id,
      title: bm.title || '',
      link: bm.link || ''
    });
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Saved Items</h2>
        <p className="text-xs text-slate-500">Sign in to access your saved questions, papers, and opportunities.</p>
      </div>
    );
  }

  const filtered = bookmarks.filter(
    (b) => activeTab === 'all' || b.item_type === activeTab
  );

  const getIcon = (type: BookmarkType['item_type']) => {
    switch (type) {
      case 'question': return <HelpCircle className="w-4 h-4 text-indigo-500" />;
      case 'paper': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'scholarship': return <Award className="w-4 h-4 text-amber-500" />;
      case 'lost_found': return <PackageSearch className="w-4 h-4 text-emerald-500" />;
      default: return <Bookmark className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-indigo-600 fill-indigo-600" />
          <span>Saved Academic Library</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your bookmarked questions, exam papers, scholarships, and campus listings for fast offline access.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab('question')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeTab === 'question'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Questions ({bookmarks.filter((b) => b.item_type === 'question').length})
        </button>
        <button
          onClick={() => setActiveTab('paper')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeTab === 'paper'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Past Papers ({bookmarks.filter((b) => b.item_type === 'paper').length})
        </button>
        <button
          onClick={() => setActiveTab('scholarship')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeTab === 'scholarship'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Scholarships ({bookmarks.filter((b) => b.item_type === 'scholarship').length})
        </button>
      </div>

      {/* Bookmarks List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No bookmarked items"
          description="Bookmark questions, past papers, and scholarships to easily find them later."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((bm) => (
            <div
              key={bm.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                  {getIcon(bm.item_type)}
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {bm.category || bm.item_type}
                  </span>
                  <Link
                    href={bm.link || '/'}
                    className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 transition truncate block"
                  >
                    {bm.title || `Saved ${bm.item_type}`}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={bm.link || '/'}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Open item"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleRemove(bm)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
