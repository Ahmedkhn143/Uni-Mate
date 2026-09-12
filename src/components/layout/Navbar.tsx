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
  PackageSearch,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
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

  if (isPublicLanding) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
                    UniMate
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200/70 dark:border-indigo-800">
                    KFUEIT Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Public Center Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/#features"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Features
              </Link>
              <Link
                href={user ? "/questions" : "/login"}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Q&A Forum
              </Link>
              <Link
                href={user ? "/past-papers" : "/login"}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Past Papers
              </Link>
              <Link
                href={user ? "/lost-and-found" : "/login"}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Lost & Found
              </Link>
              <Link
                href={user ? "/scholarships" : "/login"}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Scholarships
              </Link>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2.5">
                  <Link
                    href={isAdmin ? '/admin' : '/dashboard'}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                  >
                    <span>{isAdmin ? 'Admin Console' : 'Go to Dashboard'}</span>
                    <span>→</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push('/login');
                    }}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Join UniMate</span>
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Landing Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-4 pb-6 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Features
              </Link>
              <Link
                href={user ? "/questions" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Q&A Forum
              </Link>
              <Link
                href={user ? "/past-papers" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Past Papers
              </Link>
              <Link
                href={user ? "/lost-and-found" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Lost & Found
              </Link>
              <Link
                href={user ? "/scholarships" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Scholarships
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isAdmin ? 'Admin Console' : 'Go to Dashboard'}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      router.push('/login');
                    }}
                    className="w-full text-center py-2 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Join UniMate
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-900 dark:from-indigo-400 dark:to-indigo-200 bg-clip-text text-transparent">
                  UniMate
                </span>
                {isAdmin ? (
                  <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
                    ADMIN CONSOLE
                  </span>
                ) : (
                  <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded border border-indigo-200 dark:border-indigo-800">
                    STUDENT
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Global Search Bar */}
          {user && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAdmin ? "Search students, flags, exam papers..." : "Search questions, past papers, lost items..."}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </form>
          )}

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Role-Specific Quick Triggers */}
                {isAdmin ? (
                  <div className="hidden lg:flex items-center gap-1.5">
                    <Link
                      href="/admin/reports"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 rounded-lg border border-red-200 dark:border-red-900 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Moderation
                    </Link>
                    <Link
                      href="/admin/past-papers"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 rounded-lg border border-purple-200 dark:border-purple-900 transition"
                    >
                      <PackageSearch className="w-3.5 h-3.5" />
                      Approvals
                    </Link>
                  </div>
                ) : (
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
                )}

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

                {/* Theme Mode Switcher */}
                <ThemeToggle />

                {/* User Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 p-1 pl-2 text-left rounded-xl transition border ${
                      isAdmin
                        ? 'border-amber-400/50 dark:border-amber-600/50 bg-amber-500/10'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                        {user.full_name}
                      </div>
                      <div className="text-[10px] font-medium flex items-center justify-end gap-1">
                        {user.role === 'admin' ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> Dean / Admin
                          </span>
                        ) : (
                          <span className="text-slate-500">Semester {user.semester || 4}</span>
                        )}
                      </div>
                    </div>
                    {/* Avatar */}
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className={`w-8 h-8 rounded-lg object-cover ring-2 ${isAdmin ? 'ring-amber-500' : 'ring-indigo-500/20'}`}
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs ${isAdmin ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                        {user.full_name.charAt(0)}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Card */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            isAdmin ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{user.email}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                          {isAdmin ? 'University Faculty Operations' : `${user.program || 'Student'} • Sem ${user.semester || 4}`}
                        </p>
                      </div>

                      <div className="py-1">
                        {isAdmin ? (
                          <>
                            <Link
                              href="/admin"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition"
                            >
                              <ShieldCheck className="w-4 h-4 text-amber-600" />
                              Admin Command Center
                            </Link>
                            <Link
                              href="/admin/reports"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                            >
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              Moderation Queue
                            </Link>
                            <Link
                              href="/admin/users"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                            >
                              <User className="w-4 h-4 text-indigo-500" />
                              Student Directory
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                            >
                              <GraduationCap className="w-4 h-4 text-indigo-600" />
                              Student Dashboard
                            </Link>
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
                              Saved Bookmarks
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
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
