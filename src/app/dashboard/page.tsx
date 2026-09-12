'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HelpCircle, 
  PackageSearch, 
  FileText, 
  Award, 
  PlusCircle, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Download, 
  MessageSquare, 
  Bookmark, 
  TrendingUp,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Question, LostFoundItem, PastPaper, Scholarship, Post, Notification } from '@/types/database';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isStudent, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [discussions, setDiscussions] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadData = () => {
      setQuestions(UniMateStore.getQuestions().slice(0, 4));
      setLostFound(UniMateStore.getLostFoundItems().slice(0, 3));
      setPastPapers(UniMateStore.getPastPapers().filter((p) => p.status === 'approved').slice(0, 3));
      setScholarships(UniMateStore.getScholarships().slice(0, 2));
      setDiscussions(UniMateStore.getPosts().slice(0, 2));
      setStats(UniMateStore.getStats());

      if (user) {
        setNotifications(UniMateStore.getNotifications(user.id).slice(0, 3));
      }
    };

    loadData();
    return UniMateStore.subscribe(loadData);
  }, [user]);

  if (!user) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome to UniMate</h2>
        <p className="text-xs text-slate-500">Please sign in to access your student dashboard.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Sign In Now
        </Link>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Administrator Session Active</h2>
        <p className="text-xs text-slate-500">You are logged in as a Campus Administrator. Please proceed to the Administration Console.</p>
        <Link href="/admin" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition">
          Open Admin Command Center →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. WELCOME HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Campus Dashboard • {user.department_name || 'Academic Commons'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.full_name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              {user.program} {user.semester ? `• Semester ${user.semester}` : ''} | Keep up with latest course questions, lost items, and midterm preparation papers.
            </p>
          </div>

          {/* Quick Metrics */}
          {stats && (
            <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
              <div className="px-3 border-r border-white/10">
                <div className="text-lg font-black">{stats.activeQuestions}</div>
                <div className="text-[10px] text-indigo-200">Active Q&A</div>
              </div>
              <div className="px-3 border-r border-white/10">
                <div className="text-lg font-black">{stats.pastPapersCount}</div>
                <div className="text-[10px] text-indigo-200">Past Papers</div>
              </div>
              <div className="px-3">
                <div className="text-lg font-black">{stats.lostItems + stats.foundItems}</div>
                <div className="text-[10px] text-indigo-200">Lost & Found</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. QUICK ACTIONS BAR */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/questions/ask"
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ask Question</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Coursework help</span>
          </Link>

          <Link
            href="/lost-and-found/create?type=lost"
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-red-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <PackageSearch className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Report Lost</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Missing belongings</span>
          </Link>

          <Link
            href="/lost-and-found/create?type=found"
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Report Found</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Hand in item</span>
          </Link>

          <Link
            href="/past-papers/upload"
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Paper</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Share exam pasts</span>
          </Link>

          <Link
            href="/past-papers"
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Past Papers</span>
            <span className="text-[10px] text-slate-400 mt-0.5">PDF library</span>
          </Link>

          <Link
            href="/scholarships"
            className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scholarships</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Grants & jobs</span>
          </Link>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Questions & Lost Items */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recent Academic Questions
                </h3>
              </div>
              <Link
                href="/questions"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                View all ({stats?.activeQuestions || 0}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                          {q.department_name}
                        </span>
                        {q.subject_name && (
                          <span className="text-[10px] font-medium text-slate-500">
                            • {q.subject_name}
                          </span>
                        )}
                        {q.is_resolved && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Solved
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/questions/${q.id}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                      >
                        {q.title}
                      </Link>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>by {q.author_name}</span>
                        <span>•</span>
                        <span>{q.answers_count} {q.answers_count === 1 ? 'answer' : 'answers'}</span>
                        <span>•</span>
                        <span>{q.upvotes} upvotes</span>
                      </div>
                    </div>

                    <Link
                      href={`/questions/${q.id}`}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lost & Found Hub Snippet */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageSearch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Campus Lost & Found Alerts
                </h3>
              </div>
              <Link
                href="/lost-and-found"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Browse directory <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {lostFound.map((item) => (
                <Link
                  key={item.id}
                  href={`/lost-and-found/${item.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          item.type === 'lost'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Latest Papers, Scholarships, Notifications */}
        <div className="space-y-8">
          
          {/* Latest Past Papers */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Verified Exam Papers
                </h3>
              </div>
              <Link href="/past-papers" className="text-[11px] font-bold text-indigo-600 hover:underline">
                All Papers →
              </Link>
            </div>

            <div className="space-y-2.5">
              {pastPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-indigo-600">{paper.subject_code}</span>
                    <span className="text-slate-400">{paper.year} • {paper.exam_type}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {paper.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{paper.file_size_kb} KB PDF</span>
                    <a
                      href={paper.file_url}
                      download
                      onClick={() => UniMateStore.incrementDownload(paper.id)}
                      className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Opportunities */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Opportunities
                </h3>
              </div>
              <Link href="/scholarships" className="text-[11px] font-bold text-indigo-600 hover:underline">
                Explore →
              </Link>
            </div>

            <div className="space-y-3">
              {scholarships.map((sch) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-emerald-600">{sch.category}</span>
                    <span className="text-slate-400">{sch.amount}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                    {sch.title}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> {sch.deadline}
                    </span>
                    <Link href="/scholarships" className="text-indigo-600 hover:underline font-semibold">
                      View details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
