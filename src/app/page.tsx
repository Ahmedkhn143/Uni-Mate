'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  HelpCircle, 
  PackageSearch, 
  FileText, 
  Award, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Download, 
  Clock, 
  Search,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        
        {/* Decorative ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-emerald-400/20 blur-3xl -z-10 pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>The Verified University Student Hub</span>
            <span className="w-1 h-1 rounded-full bg-indigo-400" />
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Live for Fall Term</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Your University.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              Your Community.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ask questions, find lost items, access past papers, discover opportunities, and connect with your university community — all in one place.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all hover:scale-[1.02]"
            >
              <span>{user ? "Go to Student Dashboard" : "Join UniMate"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/questions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-700 transition"
            >
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Explore Community</span>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>University Email Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free Past Exam Library</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Faculty Moderated</span>
            </div>
          </div>

          {/* Interactive Feature Preview Card */}
          <div className="mt-14 relative mx-auto max-w-4xl rounded-3xl p-2 bg-gradient-to-b from-slate-200/80 to-slate-100/40 dark:from-slate-700/60 dark:to-slate-800/20 shadow-2xl border border-slate-200/60 dark:border-slate-800">
            <div className="rounded-2xl bg-white dark:bg-slate-900 overflow-hidden p-6 sm:p-8 text-left">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-400">unimate.campus.portal</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-lg">
                  Fall Semester Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">
                    <HelpCircle className="w-4 h-4" /> Academic Q&A
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Dijkstra Indexed Min-Heap</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Accepted answer by Maya Patel (EE TA) with step-by-step proofs.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                    <PackageSearch className="w-4 h-4" /> Lost & Found
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Student ID Card (Library 2F)</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Found blue lanyard ID card. Handed over to library front desk.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-1">
                    <FileText className="w-4 h-4" /> Verified Past Papers
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">CS-201 Midterm 2025</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">418 downloads • Solved & verified by department faculty.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHAT IS UNIMATE? */}
      <section className="w-full py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              The Digital Campus Commons
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Everything University Students Need in One Cohesive Platform
            </h3>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              University life shouldn’t be scattered across disconnected WhatsApp groups, lost noticeboards, and inaccessible resource drives. UniMate unifies academics, campus life, and student career opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Coursework Q&A & Peer Help
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Stuck on a tricky algorithm, circuits lab, or business case? Ask your course peers and TAs with rich code and formula support.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <PackageSearch className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Campus-Wide Lost & Found
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Lost your calculator, student ID, keys, or lab notebook? Post quick photo alerts and resolve them safely through in-app messaging.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Structured Past Exam Papers
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Organized hierarchically by Department → Program → Semester → Subject → Year. Instant in-browser previews and verified downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="w-full py-20 bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Simple & Verified
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              How UniMate Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-5">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Sign Up with University Email
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                Authenticate using your approved institutional email domain to maintain a trusted, scam-free campus community.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-5">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Select Department & Program
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                Tailor your feed to your degree (CS, Electrical, Business, Media) and get relevant exam papers and course discussions.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-5">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                Connect, Learn & Excel
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
                Ask questions, download past papers, reclaim lost items, apply for scholarships, and message fellow students securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACADEMIC PAST PAPERS SPOTLIGHT */}
      <section className="w-full py-20 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="md:w-1/2 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>Academic Resource Archive</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Subject-Wise Solved Past Papers
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Never search through confusing shared drives again. Our resource archive is verified by department moderators and organized by semester, year, and examination type.
              </p>
              
              <ul className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified Midterm & Final examinations with faculty annotations</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant in-browser PDF preview without forced downloads</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Bookmark essential papers for offline study review</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/past-papers"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
                >
                  <span>Browse Exam Papers Directory</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Paper card preview */}
            <div className="md:w-1/2 w-full">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    CS-201 • Semester 3
                  </span>
                  <span className="text-xs text-slate-400">Year 2025 • Midterm</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Data Structures & Algorithms Midterm Examination
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete annotated midterm covering Stacks, Linked Lists, Binary Search Trees, and Heaps. Verified by Dr. Sarah Hayes.
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-700 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Download className="w-4 h-4 text-slate-400" /> 418 downloads
                  </span>
                  <Link
                    href="/past-papers"
                    className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    View Paper
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SCHOLARSHIPS & OPPORTUNITIES */}
      <section className="w-full py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
              <Award className="w-4 h-4" />
              <span>Career & Funding</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Scholarships, Internships & Competitions
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Discover verified grant opportunities, corporate engineering internships, and research fellowships curated for your university.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Merit Scholarship
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  $10,000 / Year
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                Future Tech Leaders STEM Merit Scholarship 2026
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Full tuition coverage and executive mentorship for undergraduate students in CS and Electrical Engineering with 3.4+ GPA.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Deadline: Oct 31, 2026
                </span>
                <Link href="/scholarships" className="font-bold text-indigo-600 hover:underline">
                  Details & Apply →
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Paid Internship
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  $54/hr + Housing
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                Summer 2027 Distributed Systems Fellowship
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                12-week intensive engineering internship at Apex Cloud Labs working with Go, TypeScript, and edge distributed caching.
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" /> Closing Soon: Sep 30, 2026
                </span>
                <Link href="/scholarships" className="font-bold text-indigo-600 hover:underline">
                  Details & Apply →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="w-full py-20 bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Connect with your campus community today.
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join thousands of verified university students collaborating on coursework, sharing resources, and building campus connections.
          </p>
          <div className="pt-2">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-xl hover:scale-105 transition-all"
            >
              <span>{user ? "Open Student Dashboard" : "Get Started — It's Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
