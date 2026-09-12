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
  Flame,
  Plus
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  if (!user) return null;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Community Posts', href: '/community', icon: Users },
    { label: 'Q&A Questions', href: '/questions', icon: HelpCircle },
    { label: 'Lost & Found', href: '/lost-and-found', icon: PackageSearch },
    { label: 'Past Papers', href: '/past-papers', icon: FileText },
    { label: 'Subjects', href: '/subjects', icon: BookOpen },
    { label: 'Scholarships & Jobs', href: '/scholarships', icon: Award },
    { label: 'Direct Messages', href: '/messages', icon: MessageSquare },
    { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  ];

  const adminNavItems = [
    { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Reports & Flagged', href: '/admin/reports', icon: ShieldCheck },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Paper Moderation', href: '/admin/past-papers', icon: FileText },
    { label: 'Academic Setup', href: '/admin/academic', icon: BookOpen },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      
      {/* Quick Action Button */}
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
          Campus Hub
        </div>
        {navItems.map((item) => {
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

      {/* Admin Suite Section (Only visible to Admin) */}
      {isAdmin && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Suite
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
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/40 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Department Badge Card */}
      <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-emerald-50/40 dark:from-slate-800/60 dark:to-slate-800/30 border border-indigo-100/80 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {user.department_name || 'All Departments'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {user.role === 'admin' ? 'Active Moderator' : `${user.program || 'Student'} • Sem ${user.semester || 1}`}
          </p>
        </div>
      </div>

    </aside>
  );
}
