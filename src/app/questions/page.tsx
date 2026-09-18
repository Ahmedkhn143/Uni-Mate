'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  PlusCircle, 
  Search, 
  Filter, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Question, Department, Subject } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

export default function QuestionsPage() {
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'unanswered' | 'most_discussed'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    const load = () => {
      setQuestions(UniMateStore.getQuestions());
      setDepartments(UniMateStore.getDepartments());
      setSubjects(UniMateStore.getSubjects());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  const handleVote = (e: React.MouseEvent, qId: string) => {
    e.preventDefault();
    e.stopPropagation();
    UniMateStore.voteQuestion(qId, 'up');
  };

  // Collect all unique tags
  const allTags = Array.from(new Set(questions.flatMap((q) => q.tags || [])));

  // Filter and sort questions
  const filtered = questions.filter((q) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesDept = selectedDept === 'all' || q.department_id === selectedDept;
    const matchesTag = selectedTag === 'all' || (q.tags && q.tags.includes(selectedTag));

    return matchesSearch && matchesDept && matchesTag;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (activeTab === 'popular') return (b.upvotes || 0) - (a.upvotes || 0);
    if (activeTab === 'unanswered') {
      if (a.answers_count === 0 && b.answers_count > 0) return -1;
      if (b.answers_count === 0 && a.answers_count > 0) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (activeTab === 'most_discussed') return (b.answers_count || 0) - (a.answers_count || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      
      {/* Header with Title and Ask CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Academic Q&A Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ask homework questions, clarify lecture concepts, and collaborate with course peers and academic mentors.
          </p>
        </div>

        <Link
          href="/questions/ask"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Ask a Question
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, code snippet, or algorithm..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Department Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Tabs (Latest, Popular, Unanswered, Most Discussed) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('latest')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'latest'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'popular'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => setActiveTab('unanswered')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'unanswered'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Unanswered
          </button>
          <button
            onClick={() => setActiveTab('most_discussed')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'most_discussed'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Most Discussed
          </button>
        </div>

        {/* Quick Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] py-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase mr-1">Tags:</span>
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2 py-0.5 rounded-md border text-[11px] transition ${
                selectedTag === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              All
            </button>
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
                className={`px-2 py-0.5 rounded-md border text-[11px] transition ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions Listing */}
      {sorted.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions found"
          description="There are no academic questions matching your selected filters. Be the first to ask!"
          actionText="Ask a Question"
          actionHref="/questions/ask"
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md transition group"
            >
              <div className="flex items-start gap-4">
                
                {/* Upvotes Counter & Vote Button */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 w-14 shrink-0">
                  <button
                    onClick={(e) => handleVote(e, q.id)}
                    className={`p-1 rounded-lg transition hover:scale-110 ${
                      q.user_voted === 'up'
                        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                        : 'text-slate-400 hover:text-indigo-600'
                    }`}
                    title="Upvote this question"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">
                    {q.upvotes}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">votes</span>
                </div>

                {/* Question Info */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                      {q.department_name}
                    </span>
                    {q.subject_name && (
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        • {q.subject_name}
                      </span>
                    )}
                    {q.is_resolved && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Accepted Answer
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/questions/${q.id}`}
                    className="block text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {q.title}
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {q.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Stats & Author */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {q.author_avatar ? (
                        <img src={q.author_avatar} alt={q.author_name} className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold">
                          {q.author_name.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{q.author_name}</span>
                      <span>•</span>
                      <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{q.answers_count}</span> answers
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
