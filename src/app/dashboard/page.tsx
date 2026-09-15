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
  ShieldCheck, 
  Sun, 
  Moon,
  Camera,
  Edit3,
  X,
  User,
  Save,
  Upload,
  Users,
  Layers,
  Hash,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Question, LostFoundItem, PastPaper, Scholarship, Post, Notification } from '@/types/database';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useTheme } from '@/lib/theme-context';
import { KFUEIT_PROGRAMS } from '@/lib/constants';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isStudent, isAdmin, isLoading, updateCurrentUserProfile } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  // Edit Profile Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editProgram, setEditProgram] = useState('');
  const [editSemester, setEditSemester] = useState(1);
  const [editRegNo, setEditRegNo] = useState('');
  const [editIsAnonymous, setEditIsAnonymous] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const openEditProfile = () => {
    if (!user) return;
    setEditFullName(user.full_name || '');
    setEditProgram(user.program || '');
    setEditSemester(user.semester || 1);
    setEditRegNo(user.reg_no || '');
    setEditIsAnonymous(user.is_anonymous || false);
    setEditBio(user.bio || '');
    setEditAvatarPreview(user.avatar_url || null);
    setProfileMsg('');
    setEditModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile photo must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setEditAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    const finalProgram = editProgram.trim() || 'BS Computer Science';

    await updateCurrentUserProfile({
      full_name: editFullName.trim(),
      program: finalProgram,
      semester: Number(editSemester),
      reg_no: editRegNo.trim() || undefined,
      is_anonymous: editIsAnonymous,
      bio: editBio.trim(),
      avatar_url: editAvatarPreview || undefined
    });

    setSavingProfile(false);
    setProfileMsg('Profile updated successfully!');
    setTimeout(() => {
      setEditModalOpen(false);
      setProfileMsg('');
    }, 600);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, isLoading, router]);
  
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

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading student workspace...</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      
      {/* 1. WELCOME HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4.5 max-w-xl">
            {/* Student/Admin Avatar with Quick Edit Button */}
            <div className="relative group shrink-0">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/25 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center ring-4 ring-white/20 shadow-xl">
                  {user.full_name.charAt(0)}
                </div>
              )}
              <button
                type="button"
                onClick={openEditProfile}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-white text-indigo-700 shadow-md hover:scale-110 transition cursor-pointer"
                title="Change profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Campus Dashboard • {user.department_name || (user.role === 'admin' ? 'Administration' : 'Academic Commons')}</span>
                </div>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> Campus Admin
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {user.full_name}! 👋
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-xs font-bold text-white transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile / Photo</span>
                  </button>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Console →</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Student Registration Number & Anonymity Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {user.reg_no ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/25 backdrop-blur-md text-[11px] font-mono font-bold text-indigo-100 border border-white/10">
                    <Hash className="w-3 h-3 text-emerald-300" />
                    <span>Reg #: {user.reg_no}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openEditProfile}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/25 hover:bg-black/40 backdrop-blur-md text-[11px] font-mono font-semibold text-amber-200 border border-amber-300/30 transition"
                  >
                    <span>+ Add Reg #</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={openEditProfile}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold backdrop-blur-md border transition ${
                    user.is_anonymous
                      ? 'bg-amber-500/25 border-amber-300/40 text-amber-200 hover:bg-amber-500/35'
                      : 'bg-emerald-500/25 border-emerald-300/40 text-emerald-200 hover:bg-emerald-500/35'
                  }`}
                  title={
                    user.is_anonymous
                      ? 'Anonymous Mode Active: Other students only see your display name; your reg # and email are hidden. Admins see full details.'
                      : 'Public Profile: Your campus profile is visible to fellow students.'
                  }
                >
                  {user.is_anonymous ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  <span>{user.is_anonymous ? '🔒 Anonymous Mode Active' : '🌐 Public Profile'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                {user.program || 'Student'} {user.semester ? `• Semester ${user.semester}` : ''} | Keep up with latest course questions, lost items, and midterm preparation papers.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          {stats && (
            <div className="flex items-center gap-2 sm:gap-3 bg-black/25 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/10 text-center shrink-0">
              <div className="px-2.5 sm:px-3 border-r border-white/10">
                <div className="text-base sm:text-lg font-black text-white">{stats.totalPosts ?? 0}</div>
                <div className="text-[10px] text-indigo-200 font-medium">Campus Posts</div>
              </div>
              <div className="px-2.5 sm:px-3 border-r border-white/10">
                <div className="text-base sm:text-lg font-black text-white">{stats.totalStudents ?? 0}</div>
                <div className="text-[10px] text-indigo-200 font-medium">Students</div>
              </div>
              <div className="px-2.5 sm:px-3 border-r border-white/10">
                <div className="text-base sm:text-lg font-black text-white">{stats.activeQuestions ?? 0}</div>
                <div className="text-[10px] text-indigo-200 font-medium">Active Q&A</div>
              </div>
              <div className="px-2.5 sm:px-3">
                <div className="text-base sm:text-lg font-black text-white">{stats.pastPapersCount ?? 0}</div>
                <div className="text-[10px] text-indigo-200 font-medium">Past Papers</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. CAMPUS OVERVIEW & PLATFORM COUNTERS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Post Counter Card */}
          <Link
            href="/community"
            className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Community
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.totalPosts ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Total Campus Posts
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Announcements, discussions & study resources
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Community Feed</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>

          {/* User Counter Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Network
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.totalStudents ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Enrolled Students & Users
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Verified KFUEIT campus community members
              </p>
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Campus Verified Accounts</span>
            </div>
          </div>

          {/* Active Q&A Card */}
          <Link
            href="/questions"
            className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {stats.totalAnswers ?? 0} Solutions
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.activeQuestions ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Active Q&A Discussions
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Subject queries and midterm peer assistance
              </p>
            </div>
            <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Ask or Answer →</span>
            </div>
          </Link>

          {/* Exam Archive Card */}
          <Link
            href="/past-papers"
            className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Verified
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.pastPapersCount ?? 0}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                Past Exam Papers
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Departmental midterms, finals & solved papers
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Browse Archive →</span>
            </div>
          </Link>

        </div>
      )}

      {/* 2. QUICK ACTIONS BAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>
        </div>
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

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Student Profile</h3>
                  <p className="text-[11px] text-slate-500">Update your photo, degree program, and information</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Profile Picture Upload & Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                <div className="relative group shrink-0">
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-2xl font-black shadow-md">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                  {editAvatarPreview && (
                    <button
                      type="button"
                      onClick={() => setEditAvatarPreview(null)}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Profile Picture
                  </label>
                  <p className="text-[11px] text-slate-500">Upload JPG, PNG or WEBP from your device (Max 5MB)</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-sm transition">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                />
              </div>

              {/* Degree Program & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Degree Program <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editProgram}
                    onChange={(e) => setEditProgram(e.target.value)}
                    placeholder="e.g. Computer Science, Cyber Security, etc."
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Current Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Registration Number Field */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Student Registration Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">#</span>
                  <input
                    type="text"
                    value={editRegNo}
                    onChange={(e) => setEditRegNo(e.target.value)}
                    placeholder="e.g. BSCS-2022-45 or 2022-CS-0045"
                    className="w-full pl-7 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Official student registration roll number</p>
              </div>

              {/* Anonymous Mode Privacy Setting */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setEditIsAnonymous((prev) => !prev)}
                  className={`relative shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    editIsAnonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      editIsAnonymous ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div className="space-y-0.5">
                  <label
                    onClick={() => setEditIsAnonymous((prev) => !prev)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3 text-indigo-500" />
                    <span>Post Anonymously by Default</span>
                  </label>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    When enabled, other students only see your display name or <strong>"Anonymous Student"</strong>; your registration number & email are strictly hidden. Administrators always retain verified access for university safety.
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Student Bio / Interests
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Share your interests, coursework focus, or study goals..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
