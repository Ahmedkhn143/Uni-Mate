'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  PackageSearch, 
  Award, 
  Users, 
  BookOpen, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UniMateStore } from '@/lib/store';
import { EmptyState } from '@/components/ui/EmptyState';

function GlobalSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'all' | 'questions' | 'papers' | 'lost_found' | 'scholarships' | 'posts' | 'subjects'>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const questions = UniMateStore.getQuestions().filter(
    (q) => q.title.toLowerCase().includes(query.toLowerCase()) || q.description.toLowerCase().includes(query.toLowerCase())
  );

  const papers = UniMateStore.getPastPapers().filter(
    (p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.subject_code.toLowerCase().includes(query.toLowerCase())
  );

  const lostFound = UniMateStore.getLostFoundItems().filter(
    (item) => item.title.toLowerCase().includes(query.toLowerCase()) || item.location.toLowerCase().includes(query.toLowerCase())
  );

  const scholarships = UniMateStore.getScholarships().filter(
    (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.organization.toLowerCase().includes(query.toLowerCase())
  );

  const posts = UniMateStore.getPosts().filter(
    (p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.content.toLowerCase().includes(query.toLowerCase())
  );

  const subjects = UniMateStore.getSubjects().filter(
    (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.code.toLowerCase().includes(query.toLowerCase())
  );

  const totalMatches = questions.length + papers.length + lostFound.length + scholarships.length + posts.length + subjects.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Search Header Bar */}
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Search className="w-6 h-6 text-indigo-600" />
          <span>Campus Global Search</span>
        </h1>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across questions, exam papers, lost items, scholarships, and subjects..."
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Results ({totalMatches})
        </button>
        <button
          onClick={() => setActiveFilter('questions')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeFilter === 'questions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Q&A ({questions.length})
        </button>
        <button
          onClick={() => setActiveFilter('papers')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeFilter === 'papers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Past Papers ({papers.length})
        </button>
        <button
          onClick={() => setActiveFilter('lost_found')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeFilter === 'lost_found'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Lost & Found ({lostFound.length})
        </button>
        <button
          onClick={() => setActiveFilter('scholarships')}
          className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
            activeFilter === 'scholarships'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Opportunities ({scholarships.length})
        </button>
      </div>

      {/* Results Content */}
      {totalMatches === 0 ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description={`We couldn't find anything matching "${query}". Try searching for broader terms like "Data Structures", "Calculator", or "Midterm".`}
        />
      ) : (
        <div className="space-y-6">
          
          {/* Questions Section */}
          {(activeFilter === 'all' || activeFilter === 'questions') && questions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" /> Academic Questions ({questions.length})
              </h3>
              <div className="space-y-2">
                {questions.map((q) => (
                  <Link
                    key={q.id}
                    href={`/questions/${q.id}`}
                    className="block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{q.title}</h4>
                      <span className="text-[10px] text-indigo-600 font-semibold">{q.answers_count} answers</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{q.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Past Papers Section */}
          {(activeFilter === 'all' || activeFilter === 'papers') && papers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" /> Past Papers ({papers.length})
              </h3>
              <div className="space-y-2">
                {papers.map((p) => (
                  <Link
                    key={p.id}
                    href={`/past-papers`}
                    className="block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{p.title}</h4>
                      <span className="text-[10px] text-purple-600 font-bold">{p.subject_code}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.subject_name} • {p.year} {p.exam_type.toUpperCase()}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lost & Found Section */}
          {(activeFilter === 'all' || activeFilter === 'lost_found') && lostFound.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <PackageSearch className="w-4 h-4 text-emerald-500" /> Lost & Found ({lostFound.length})
              </h3>
              <div className="space-y-2">
                {lostFound.map((lf) => (
                  <Link
                    key={lf.id}
                    href={`/lost-and-found/${lf.id}`}
                    className="block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{lf.title}</h4>
                      <span className="text-[10px] font-bold uppercase text-emerald-600">{lf.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{lf.location} • {lf.event_date}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Scholarships Section */}
          {(activeFilter === 'all' || activeFilter === 'scholarships') && scholarships.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Opportunities ({scholarships.length})
              </h3>
              <div className="space-y-2">
                {scholarships.map((s) => (
                  <Link
                    key={s.id}
                    href={`/scholarships`}
                    className="block p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{s.title}</h4>
                      <span className="text-xs font-bold text-amber-600">{s.amount || s.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.organization} • Deadline: {s.deadline}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default function GlobalSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Searching UniMate catalog...</div>}>
      <GlobalSearchContent />
    </Suspense>
  );
}
