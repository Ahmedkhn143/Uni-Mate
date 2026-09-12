'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  HelpCircle, 
  Users, 
  PackageSearch, 
  FileText, 
  BookOpen, 
  Award, 
  MessageSquare, 
  Bookmark, 
  ShieldCheck, 
  Sparkles,
  Settings,
  Plus,
  AlertTriangle,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAuth, PERMANENT_ACCOUNTS } from '@/lib/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  const studentNavItems = [
    { label: 'Student Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Community Posts', href: '/community', icon: Users },
    { label: 'Q&A Questions', href: '/questions', icon: HelpCircle },
    { label: 'Lost & Found', href: '/lost-and-found', icon: PackageSearch },
    { label: 'Past Papers', href: '/past-papers', icon: FileText },
    { label: 'Department Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Scholarships & Jobs', href: '/scholarships', icon: Award },
    { label: 'Direct Messages', href: '/messages', icon: MessageSquare },
    { label: 'Saved Bookmarks', href: '/bookmarks', icon: Bookmark },
  ];

  const adminNavItems = [
    { label: 'Command Center', href: '/admin', icon: LayoutDashboard },
    { label: 'Moderation Queue', href: '/admin/reports', icon: AlertTriangle },
    { label: 'Student Directory', href: '/admin/users', icon: Users },
    { label: 'Paper Approvals', href: '/admin/past-papers', icon: FileText },
    { label: 'Academic Setup', href: '/admin/academic', icon: BookOpen },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const adminInspectionItems = [
    { label: 'Campus Community', href: '/community', icon: Users },
    { label: 'Academic Q&A', href: '/questions', icon: HelpCircle },
    { label: 'Lost & Found', href: '/lost-and-found', icon: PackageSearch },
    { label: 'Past Papers Library', href: '/past-papers', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // -------------------------------------------------------------
  // ADMIN SIDEBAR RENDER
  // -------------------------------------------------------------
  if (isAdmin) {
    return (
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800 bg-slate-950/90 text-slate-200 backdrop-blur-md p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        
        {/* Admin Quick Action Button */}
        <div className="mb-4">
          <Link
            href="/admin/reports"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all hover:scale-[1.01]"
          >
            <AlertTriangle className="w-4 h-4" />
            Moderation Queue
          </Link>
        </div>

        {/* Primary Admin Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMINISTRATOR CONSOLE
          </div>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Campus Inspection Section */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Student Portal View</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </div>
          {adminInspectionItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-indigo-600/30 text-indigo-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Admin Dean Card */}
        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-200 truncate">
                {user.full_name}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono truncate">
              {PERMANENT_ACCOUNTS.ADMIN.email}
            </p>
            <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
              Campus Administrator
            </span>
          </div>
        </div>

      </aside>
    );
  }

  // -------------------------------------------------------------
  // STUDENT SIDEBAR RENDER (Default)
  // -------------------------------------------------------------
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      
      {/* Quick Action Button for Students */}
      <div className="mb-4">
        <Link
          href="/questions/ask"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          Ask Community
        </Link>
      </div>

      {/* Main Student Navigation */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          STUDENT ACADEMIC HUB
        </div>
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Student Profile Card */}
      <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-emerald-50/40 dark:from-slate-800/60 dark:to-slate-800/30 border border-indigo-100/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
              {user.full_name}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed truncate">
            {user.program || 'Computer Science'} • Sem {user.semester || 4}
          </p>
          <span className="inline-block mt-1 text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
            {PERMANENT_ACCOUNTS.STUDENT.email}
          </span>
        </div>
      </div>

    </aside>
  );
}
