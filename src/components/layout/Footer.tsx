'use client';

import React from 'react';
import Link from 'next/link';
import { GraduationCap, Heart, Shield, HelpCircle, BookOpen, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pt-12 pb-16 md:pb-12 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200/70 dark:border-slate-800/80">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                UniMate
              </span>
            </div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Your University. Your Community.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Connect. Learn. Share. Help. An integrated platform for university students to collaborate on coursework, recover lost items, access past exam papers, and unlock opportunities.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Campus Verified • Protected by Student Code of Conduct</span>
            </div>
          </div>

          {/* Academic Columns */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Academics
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/questions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Questions & Answers
                </Link>
              </li>
              <li>
                <Link href="/past-papers" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Past Exam Papers
                </Link>
              </li>
              <li>
                <Link href="/subjects" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Subject Directory
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Study Discussions
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Life */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Campus Life
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/lost-and-found" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Lost & Found Hub
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Scholarships & Grants
                </Link>
              </li>
              <li>
                <Link href="/messages" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Student Messaging
                </Link>
              </li>
              <li>
                <Link href="/bookmarks" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Saved Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Moderation & Ethics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  Admin Portal
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Academic Integrity Policy</span>
              </li>
              <li>
                <span className="text-slate-400">Honor Code</span>
              </li>
              <li>
                <span className="text-slate-400">Privacy & Terms</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} UniMate Platform. Built with academic excellence for university students.</p>
          <div className="flex items-center gap-1">
            <span>Crafted for student success</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
