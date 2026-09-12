'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Search, 
  Bell, 
  Bookmark, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  LogOut, 
  Sparkles,
  Menu, 
  X,
  PlusCircle,
  HelpCircle,
  PackageSearch
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';

export function Navbar() {
  const { user, isAdmin, logout, switchUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const updateCounts = () => {
      const notifs = UniMateStore.getNotifications(user.id);
      setUnreadNotifs(notifs.filter((n) => !n.is_read).length);

      const convs = UniMateStore.getConversations(user.id);
      const unreadTotal = convs.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      setUnreadMessages(unreadTotal);
    };

    updateCounts();
    return UniMateStore.subscribe(updateCounts);
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isPublicLanding = pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
                  UniMate
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                  Campus
                </span>
              </div>
            </Link>
          </div>

          {/* Global Search Bar (Shown when logged in or on search) */}
          {user && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions, past papers, lost items..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </form>
          )}

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Ask / Report Quick Trigger */}
                <div className="hidden lg:flex items-center gap-1.5">
                  <Link
                    href="/questions/ask"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg border border-indigo-200/60 dark:border-indigo-800 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Ask Question
                  </Link>
                  <Link
                    href="/lost-and-found/create"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200/60 dark:border-emerald-800 transition"
                  >
                    <PackageSearch className="w-3.5 h-3.5" />
                    Lost & Found
                  </Link>
                </div>

                {/* Messages Icon */}
                <Link
                  href="/messages"
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications Icon */}
                <Link
                  href="/notifications"
                  className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
                      {unreadNotifs}
                    </span>
                  )}
                </Link>

                {/* Bookmarks Icon */}
                <Link
                  href="/bookmarks"
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  title="Saved Bookmarks"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition"
                  >
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                        {user.full_name}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                        {user.role === 'admin' ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : (
                          <span>Semester {user.semester || 4}</span>
                        )}
                      </div>
                    </div>
                    {/* Avatar */}
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                        {user.full_name.charAt(0)}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                          {user.program || user.department_name}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          View Student Profile
                        </Link>
                        <Link
                          href="/bookmarks"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          Saved Items
                        </Link>

                        {/* Admin Link */}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Admin Moderation Dashboard
                          </Link>
                        )}
                      </div>

                      {/* Demo Quick Switcher */}
                      <div className="p-2 border-t border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          Quick Switch Role
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <button
                            onClick={() => {
                              switchUser('student');
                              setUserDropdownOpen(false);
                            }}
                            className={`px-2 py-1.5 rounded-lg text-left font-medium transition ${
                              user.role === 'student'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60'
                            }`}
                          >
                            Student
                          </button>
                          <button
                            onClick={() => {
                              switchUser('admin');
                              setUserDropdownOpen(false);
                              router.push('/admin');
                            }}
                            className={`px-2 py-1.5 rounded-lg text-left font-medium transition ${
                              user.role === 'admin'
                                ? 'bg-amber-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60'
                            }`}
                          >
                            Admin
                          </button>
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                            router.push('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition"
                >
                  Join UniMate
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {user && (
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search UniMate..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl"
                />
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              Community
            </Link>
            <Link
              href="/questions"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              Q&A Hub
            </Link>
            <Link
              href="/lost-and-found"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              Lost & Found
            </Link>
            <Link
              href="/past-papers"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              Past Papers
            </Link>
            <Link
              href="/scholarships"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
            >
              Opportunities
            </Link>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold"
            >
              <ShieldCheck className="w-4 h-4" /> Admin Moderation
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
