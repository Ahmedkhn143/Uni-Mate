'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  PackageSearch, 
  Award, 
  Users, 
  Download, 
  Clock, 
  BookOpen, 
  Search, 
  Star, 
  MessageSquare, 
  Lock, 
  Layers, 
  Zap, 
  ChevronDown, 
  MapPin, 
  Building2, 
  Code2, 
  Cpu, 
  TrendingUp,
  ThumbsUp,
  Check,
  Share2,
  Bookmark,
  Shield,
  Radio,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'papers' | 'qa' | 'lost' | 'grants'>('papers');
  const [selectedDept, setSelectedDept] = useState<'cs' | 'eng' | 'mgmt' | 'sci'>('cs');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const departments = [
    {
      id: 'cs',
      name: 'Computer Science & IT',
      icon: Code2,
      degrees: ['BS Computer Science', 'BS Software Engineering', 'BS Data Science', 'BS Artificial Intelligence'],
      papersCount: 342,
      activeQuestions: 128,
      students: '1,450+'
    },
    {
      id: 'eng',
      name: 'Engineering & Technology',
      icon: Cpu,
      degrees: ['BS Electrical Engineering', 'BS Mechanical Engineering', 'BS Civil Engineering'],
      papersCount: 265,
      activeQuestions: 94,
      students: '1,120+'
    },
    {
      id: 'mgmt',
      name: 'Management Sciences',
      icon: Building2,
      degrees: ['BBA Honors', 'BS Accounting & Finance', 'BS Healthcare Management'],
      papersCount: 148,
      activeQuestions: 52,
      students: '860+'
    },
    {
      id: 'sci',
      name: 'Basic & Applied Sciences',
      icon: FlaskConical,
      degrees: ['BS Mathematics', 'BS Physics', 'BS Chemistry', 'BS Biotechnology'],
      papersCount: 115,
      activeQuestions: 38,
      students: '780+'
    }
  ];

  const faqs = [
    {
      q: 'How do I access UniMate as a KFUEIT student?',
      a: 'All current students can sign up using their official university email address ending in @kfueit.edu.pk. A 6-digit verification code will be sent to your student inbox to confirm your active enrollment.'
    },
    {
      q: 'Are the past exam papers verified and free to download?',
      a: 'Yes, 100% free. All exam papers in the archive are verified by departmental student leads and academic moderators. Papers include annotated solutions, grading schemes, and in-browser preview without forced third-party downloads.'
    },
    {
      q: 'How does the Campus Lost & Found recovery process work?',
      a: 'When you find or lose an item, post a report with the campus location and photograph. You can communicate anonymously through in-app peer messaging. Items turned in to the library or department admin offices are specially tagged as Verified Handover.'
    },
    {
      q: 'Can senior students and peer mentors answer student questions?',
      a: 'Yes. Verified top student contributors and academic peer mentors have special Mentor Badges. Their answers are highlighted with accepted verification checkmarks and pinned to the top of course discussion threads.'
    }
  ];

  const targetAuthLink = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login';

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. ULTRA-LUXURY HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative w-full overflow-hidden pt-12 pb-24 md:pt-20 md:pb-36">
        
        {/* Radiant ambient glow halos */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[100px] pointer-events-none -z-10 rounded-full" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Official University Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
              KFUEIT Official Campus Gateway
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Fall 2026 Academic Session Active
            </span>
          </div>

          {/* Prestige Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.12]">
            The Academic Operating System for{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
              KFUEIT Students.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate scattered WhatsApp groups and missing noticeboards. Connect with verified campus peers, access solved past exam papers, recover lost items in real-time, and unlock curated scholarships.
          </p>

          {/* Luxury Action Triggers */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={targetAuthLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{user ? (user.role === 'admin' ? "Open Admin Console" : "Go to Student Dashboard") : "Enter Campus Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={user ? "/past-papers" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md transition"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Browse Solved Past Papers</span>
            </Link>
          </div>

          {/* Prestige Campus Stats Ticker */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">4,200+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified KFUEIT Students</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">850+</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Solved & Annotated Papers</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">99.4%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Lost Items Claimed</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">100%</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Peer & Admin Verified</p>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE INTERACTIVE PLATFORM TERMINAL (LIVE PREVIEW WIDGET) */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full pb-24 relative -mt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="rounded-3xl p-2.5 sm:p-3.5 bg-gradient-to-b from-slate-200/90 via-slate-100 to-slate-200/70 dark:from-slate-800/90 dark:via-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-2xl">
            
            {/* Terminal Window Header */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-inner">
              
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/90" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/90" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
                  <span className="ml-2 text-xs font-mono font-medium text-slate-400">unimate.campus.terminal</span>
                </div>

                {/* Tab Controls */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('papers')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === 'papers'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Past Papers Vault
                  </button>
                  <button
                    onClick={() => setActiveTab('qa')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === 'qa'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Coursework Q&A
                  </button>
                  <button
                    onClick={() => setActiveTab('lost')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === 'lost'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Lost & Found Radar
                  </button>
                  <button
                    onClick={() => setActiveTab('grants')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeTab === 'grants'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Scholarships
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              <div className="p-6 sm:p-8">
                
                {/* 1. PAST PAPERS VAULT */}
                {activeTab === 'papers' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            DEPARTMENT OF COMPUTER SCIENCE
                          </span>
                          <span className="text-xs text-slate-400">• Semester 3 • Year 2025</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                          Data Structures & Algorithms (CS-201) Midterm Examination
                        </h3>
                      </div>

                      <Link
                        href={user ? "/past-papers" : "/login"}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Solved PDF</span>
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Exam Scope Covered</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Indexed Min-Heaps, AVL Rotations, Graph DFS/BFS</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Academic Review</span>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Student Academic Lead
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Student Utility Metric</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">418 downloads • 4.9 / 5 Rating</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        Includes step-by-step mathematical proofs and pseudo-code implementations.
                      </span>
                      <Link href={user ? "/past-papers" : "/login"} className="font-bold text-indigo-400 hover:text-indigo-300 underline">
                        View Paper Archive →
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. COURSEWORK Q&A */}
                {activeTab === 'qa' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            VERIFIED PEER SOLUTION
                          </span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">CS-302 Algorithm Engineering</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" /> 38 Upvotes
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        How to implement indexed min-heap for Dijkstra algorithm in O((V+E) log V)?
                      </h4>

                      <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                        <code>
                          {`// Heap with hashmap indexing to allow decrease_key in O(log V)
void decreaseKey(int vertex, int newDist) {
    int idx = posMap[vertex];
    heap[idx].dist = newDist;
    bubbleUp(idx); // O(log V) runtime guarantee
}`}
                        </code>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">MP</span>
                          <span>Accepted by <strong>Maya Patel (EE TA)</strong></span>
                        </span>
                        <Link href={user ? "/questions" : "/login"} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                          View Discussion Thread →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LOST & FOUND RADAR */}
                {activeTab === 'lost' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            FOUND ITEM
                          </span>
                          <span className="text-[11px] text-slate-400">15 mins ago</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          KFUEIT Student ID Card & Blue Lanyard
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Found near Computer Lab 3 on table 14. Handed over to Central Library Front Desk.
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Safe with Admin Desk
                          </span>
                          <Link href={user ? "/lost-and-found" : "/login"} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Claim ID →
                          </Link>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                            LOST ITEM ALERT
                          </span>
                          <span className="text-[11px] text-slate-400">1 hour ago</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          HP-Prime Graphic Scientific Calculator
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Left in Block B Room 204 during EE Midterm. Has yellow tape with name initial "AK".
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-slate-500">Bounty: Campus Appreciation</span>
                          <Link href={user ? "/lost-and-found" : "/login"} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Message Owner →
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 4. SCHOLARSHIPS */}
                {activeTab === 'grants' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            MERIT SCHOLARSHIP
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">$10,000 / Year</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Future Tech Leaders STEM Merit Scholarship
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Full tuition coverage and executive mentorship for undergraduate CS & EE students with 3.4+ GPA.
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> Deadline: Oct 31, 2026
                          </span>
                          <Link href={user ? "/scholarships" : "/login"} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Details & Apply →
                          </Link>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            PAID FELLOWSHIP
                          </span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">$54/hr + Housing</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Summer Distributed Systems Fellowship
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          12-week intensive engineering internship at Apex Cloud Labs working on high-throughput backend infrastructure.
                        </p>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Closing Soon: Sep 30
                          </span>
                          <Link href={user ? "/scholarships" : "/login"} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            Details & Apply →
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. LUXURY DEPARTMENTAL EXCELLENCE MATRIX */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="w-full py-24 bg-white dark:bg-slate-900 border-t border-b border-slate-200/80 dark:border-slate-800 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
              Departmental Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Organized Specifically For Your Degree
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Every course, past paper, and technical question is indexed hierarchically by Department → Degree Program → Semester → Subject.
            </p>
          </div>

          {/* Department Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {departments.map((dept) => {
              const Icon = dept.icon;
              const isSelected = selectedDept === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{dept.students} Enrolled</p>
                </button>
              );
            })}
          </div>

          {/* Selected Department Overview Card */}
          {(() => {
            const current = departments.find((d) => d.id === selectedDept) || departments[0];
            return (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    <span>Department Active Roster</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {current.name} Academic Commons
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {current.degrees.map((deg, i) => (
                      <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {deg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-8">
                  <div className="text-center">
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{current.papersCount}</p>
                    <p className="text-xs text-slate-500">Solved Papers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{current.activeQuestions}</p>
                    <p className="text-xs text-slate-500">Open Discussions</p>
                  </div>
                  <Link
                    href={user ? "/past-papers" : "/login"}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
                  >
                    Explore Academic Archive →
                  </Link>
                </div>
              </div>
            );
          })()}

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. LUXURY COMPARISON MATRIX (OLD SCATTERED LIFE VS UNIMATE) */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full py-24 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
              The Evolution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Why KFUEIT Students Switched to UniMate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Old Way */}
            <div className="p-7 rounded-3xl bg-red-950/10 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold">
                <span>The Outdated Approach</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scattered & Unverified Channels</h3>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Unorganized WhatsApp groups flooded with spam and lost announcements</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Expired Google Drive links with incomplete or illegible midterm photos</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Lost calculators and IDs taped to physical bulletin boards that get ignored</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>Scam internship links and lack of institutional university verification</span>
                </li>
              </ul>
            </div>

            {/* UniMate Way */}
            <div className="p-7 rounded-3xl bg-indigo-950/10 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The UniMate Operating System</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Centralized & Authenticated</h3>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Mandatory @kfueit.edu.pk verification creates an exclusive, scam-free campus ecosystem</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Hierarchical paper archive with verified solutions and step-by-step guides</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time Lost & Found radar with direct peer messaging and admin desk claim tagging</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Moderated opportunity board with real deadlines, funding brackets, and requirements</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full py-24 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. LUXURY GRAND FINALE CALL TO ACTION */}
      {/* ------------------------------------------------------------- */}
      <section className="w-full py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-emerald-500/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Instant Student Access with KFUEIT Email</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            Ready to elevate your university experience?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join 4,200+ fellow KFUEIT scholars collaborating on coursework, accessing solved exams, and building campus connections.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={targetAuthLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-2xl shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95"
            >
              <span>{user ? "Open Your Student Dashboard" : "Create Account with KFUEIT Email"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition"
            >
              Sign In to Existing Account
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
