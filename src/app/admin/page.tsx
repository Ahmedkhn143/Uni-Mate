'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Save,
  Upload,
  User,
  ShieldCheck, 
  Users, 
  HelpCircle, 
  FileText, 
  PackageSearch, 
  Award, 
  AlertTriangle, 
  Settings, 
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  BookOpen,
  UserX,
  Radio,
  Search,
  Check,
  X,
  ExternalLink,
  Send,
  Eye,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Hash,
  Lock,
  Globe,
  Shield,
  Calendar,
  Mail,
  GraduationCap,
  Building,
  Camera,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Report, PastPaper, Profile, Post } from '@/types/database';
import { AdminAccessDenied } from '@/components/ui/AdminAccessDenied';
import { KFUEIT_PROGRAMS } from '@/lib/constants';

export default function AdminDashboardPage() {
  const { user, isAdmin, isModerator, isModeratorOrAdmin, updateCurrentUserProfile } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingPapers, setPendingPapers] = useState<PastPaper[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'moderation' | 'papers' | 'students' | 'broadcast'>('posts');
  const [postsSubTab, setPostsSubTab] = useState<'pending' | 'live' | 'rejected'>('pending');
  const [syncingStudents, setSyncingStudents] = useState(false);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Profile | null>(null);
  
  // Broadcast Announcement State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Admin Profile Edit Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editProgram, setEditProgram] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveMsg, setProfileSaveMsg] = useState('');

  const openProfileEditModal = () => {
    if (!user) return;
    setEditFullName(user.full_name || '');
    setEditProgram(user.program || 'Campus Dean & Platform Administrator');
    setEditBio(user.bio || '');
    setEditAvatarPreview(user.avatar_url || null);
    setProfileSaveMsg('');
    setProfileModalOpen(true);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Profile photo must be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    await updateCurrentUserProfile({
      full_name: editFullName.trim() || user.full_name,
      program: editProgram.trim() || user.program,
      bio: editBio.trim(),
      avatar_url: editAvatarPreview || undefined
    });
    setSavingProfile(false);
    setProfileSaveMsg('Profile updated successfully!');
    showNotice('Admin profile saved.');
    setTimeout(() => {
      setProfileModalOpen(false);
      setProfileSaveMsg('');
    }, 800);
  };

  // Success message toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  useEffect(() => {
    const load = () => {
      setStats(UniMateStore.getStats());
      setReports(UniMateStore.getReports());
      setPendingPapers(UniMateStore.getPastPapers().filter((p) => p.status === 'pending'));
      const allAdminPosts = UniMateStore.getPosts('admin');
      setPendingPosts(allAdminPosts.filter((p) => p.status === 'pending'));
      setAllPosts(allAdminPosts);
      setProfiles(UniMateStore.getProfiles());
    };
    load();
    UniMateStore.syncProfiles();
    const unsubscribe = UniMateStore.subscribe(load);

    // Auto-sync students every 12 seconds so new registrations appear dynamically
    const interval = setInterval(() => {
      UniMateStore.syncProfiles();
    }, 12000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!isModeratorOrAdmin) {
    return <AdminAccessDenied />;
  }

  const handleResolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    UniMateStore.resolveReport(reportId, action, `Actioned by ${user?.full_name || 'Admin'} at ${new Date().toLocaleTimeString()}`);
    showNotice(`Report marked as ${action}.`);
  };

  const handlePaperStatus = (paperId: string, status: 'approved' | 'rejected') => {
    UniMateStore.setPastPaperStatus(paperId, status);
    showNotice(`Past paper status updated to ${status}.`);
  };

  const handlePostStatus = (postId: string, status: 'approved' | 'rejected') => {
    UniMateStore.setPostStatus(postId, status);
    showNotice(`Community post ${status === 'approved' ? 'approved & published' : 'rejected'}.`);
  };

  const handleToggleSuspend = (targetUserId: string, name: string) => {
    if (!isAdmin) {
      showNotice('Access Restricted: Only Super Admin can suspend accounts.');
      return;
    }
    UniMateStore.toggleUserSuspension(targetUserId);
    showNotice(`User account status updated for ${name}.`);
  };

  const handleRoleChange = (targetUserId: string, newRole: 'student' | 'moderator', name: string) => {
    if (!isAdmin) {
      showNotice('Access Restricted: Only Super Admin can assign or revoke Moderator roles.');
      return;
    }
    UniMateStore.updateUserRole(targetUserId, newRole);
    showNotice(`Role updated to ${newRole.toUpperCase()} for ${name}.`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim() || !user) return;

    UniMateStore.createPost({
      author: user,
      title: `📢 [CAMPUS ANNOUNCEMENT] ${broadcastTitle.trim()}`,
      content: broadcastContent.trim(),
      category: 'announcement',
      tags: ['AdminAlert', 'CampusOfficial', 'Announcement']
    });

    setBroadcastTitle('');
    setBroadcastContent('');
    setBroadcastSuccess(true);
    showNotice('Official campus announcement broadcasted to all students!');
    setTimeout(() => setBroadcastSuccess(false), 3500);
  };

  const filteredStudents = profiles.filter(
    (p) => 
      p.role !== 'admin' && 
      (p.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || 
       p.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
       (p.reg_no && p.reg_no.toLowerCase().includes(studentSearch.toLowerCase())) ||
       (p.program && p.program.toLowerCase().includes(studentSearch.toLowerCase())))
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* Action Toast */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{actionNotice}</span>
        </div>
      )}

      {/* 1. EXECUTIVE ADMIN CONSOLE HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4.5 max-w-2xl">
            {/* Admin Profile Photo with Quick Edit */}
            <div className="relative group shrink-0">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-amber-400/30 shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 text-amber-300 font-black text-2xl flex items-center justify-center ring-4 ring-amber-400/30 shadow-xl">
                  {user?.full_name?.charAt(0) || 'A'}
                </div>
              )}
              <button
                type="button"
                onClick={openProfileEditModal}
                className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-amber-400 text-slate-900 shadow-md hover:scale-110 transition cursor-pointer"
                title="Edit avatar & profile"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>FACULTY ADMINISTRATION & CAMPUS OPERATIONS CONSOLE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Dean & Administrator Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Logged in as <strong className="text-amber-300">{user?.full_name || 'Administrator'}</strong> ({user?.program || 'Campus Dean & Platform Administrator'}). Supervise student safety, academic content approvals, account standing, and emergency broadcasts.
              </p>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={openProfileEditModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 text-xs font-bold transition cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Profile / Avatar Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Status Badge */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>KFUEIT CAMPUS ONLINE</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Domain: @kfueit.edu.pk
            </span>
          </div>
        </div>
      </div>

      {/* 2. KEY METRICS CARDS (CLICKABLE) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* Total Students -> Directory */}
          <Link
            href="/admin/users"
            title="View Student & Faculty Directory"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1 hover:border-indigo-500/60 hover:shadow-md hover:-translate-y-1 transition cursor-pointer group block"
          >
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">Active</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalStudents}</div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-indigo-600 transition flex items-center justify-between">
              <span>Enrolled Students</span>
              <span className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition">→</span>
            </div>
          </Link>

          {/* Pending Reports (Red Alert) -> Reports Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('moderation');
              document.getElementById('admin-control-tabs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Review Flagged Reports"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-500/40 dark:border-red-500/30 shadow-sm space-y-1 text-left hover:border-red-500 hover:shadow-md hover:-translate-y-1 transition cursor-pointer w-full group block"
          >
            <div className="flex items-center justify-between text-red-600">
              <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 uppercase animate-pulse">
                Action Req.
              </span>
            </div>
            <div className="text-2xl font-black text-red-600">{stats.pendingReports}</div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-red-600 transition flex items-center justify-between">
              <span>Flagged Reports Queue</span>
              <span className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition">↓</span>
            </div>
          </button>

          {/* Pending Papers (Amber Alert) -> Papers Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('papers');
              document.getElementById('admin-control-tabs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Review Pending Examination Papers"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-sm space-y-1 text-left hover:border-amber-500 hover:shadow-md hover:-translate-y-1 transition cursor-pointer w-full group block"
          >
            <div className="flex items-center justify-between text-amber-600">
              <FileText className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Review
              </span>
            </div>
            <div className="text-2xl font-black text-amber-600">{stats.pendingPapers}</div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-amber-600 transition flex items-center justify-between">
              <span>Exam Papers Pending</span>
              <span className="text-[10px] text-amber-500 opacity-0 group-hover:opacity-100 transition">↓</span>
            </div>
          </button>

          {/* Pending Community Posts (Emerald Alert) -> Posts Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('posts');
              document.getElementById('admin-control-tabs')?.scrollIntoView({ behavior: 'smooth' });
            }}
            title="Review Pending Community Posts"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm space-y-1 text-left hover:border-emerald-500 hover:shadow-md hover:-translate-y-1 transition cursor-pointer w-full group block"
          >
            <div className="flex items-center justify-between text-emerald-600">
              <Layers className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Approval
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-600">{stats.pendingPosts}</div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-emerald-600 transition flex items-center justify-between">
              <span>Posts Awaiting Review</span>
              <span className="text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition">↓</span>
            </div>
          </button>

          {/* Academic Q&A Solved -> Questions Page */}
          <Link
            href="/questions"
            title="View Academic Q&A Discussions"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1 hover:border-purple-500/60 hover:shadow-md hover:-translate-y-1 transition cursor-pointer group block"
          >
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold text-slate-400">{stats.totalAnswers} Answers</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.activeQuestions}</div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-purple-600 transition flex items-center justify-between">
              <span>Academic Discussions</span>
              <span className="text-[10px] text-purple-500 opacity-0 group-hover:opacity-100 transition">→</span>
            </div>
          </Link>

          {/* Lost & Found Tracked -> Lost & Found Page */}
          <Link
            href="/lost-and-found"
            title="View Lost & Found Campus Items"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1 hover:border-emerald-500/60 hover:shadow-md hover:-translate-y-1 transition cursor-pointer group block"
          >
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <PackageSearch className="w-5 h-5 group-hover:scale-110 transition" />
              <span className="text-[10px] font-bold text-slate-400">{stats.foundItems} Found</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.lostItems}</div>
            <div className="text-xs text-slate-500 font-medium group-hover:text-emerald-600 transition flex items-center justify-between">
              <span>Lost Belongings Tracked</span>
              <span className="text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition">→</span>
            </div>
          </Link>

        </div>
      )}

      {/* 3. INTERACTIVE ADMIN CONTROL TABS */}
      <div id="admin-control-tabs" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Tab Header Bar */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-4 gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'posts'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Posts Management</span>
            {pendingPosts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black animate-pulse">
                {pendingPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'moderation'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Moderation Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-black">
              {reports.filter(r => r.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('papers')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'papers'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Past Paper Verification</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black">
              {pendingPapers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'students'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Directory & Suspensions</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 ${
              activeTab === 'broadcast'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Broadcast Campus Announcement</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6">
          
          {/* TAB 0: PENDING POSTS APPROVAL */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Community Posts — Full Management Console
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review, approve, reject, and manage all student community posts across the platform.
                </p>
              </div>

              {/* Posts Sub-tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPostsSubTab('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    postsSubTab === 'pending'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Pending ({pendingPosts.length})
                </button>
                <button
                  onClick={() => setPostsSubTab('live')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    postsSubTab === 'live'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Live Posts ({allPosts.filter(p => p.status === 'approved' || !p.status).length})
                </button>
                <button
                  onClick={() => setPostsSubTab('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    postsSubTab === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-700'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Rejected ({allPosts.filter(p => p.status === 'rejected').length})
                </button>
              </div>

              {/* Pending Posts */}
              {postsSubTab === 'pending' && (
                <>
                  {pendingPosts.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      All community posts are reviewed! No pending submissions.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {pendingPosts.map((post) => (
                        <div key={post.id} className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {post.title}
                              </span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                PENDING
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                {post.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span>By <strong>{post.author_name}</strong></span>
                              <span>•</span>
                              <span>{new Date(post.created_at).toLocaleString()}</span>
                              {post.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-500">#{post.tags.join(' #')}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                            <button
                              onClick={() => handlePostStatus(post.id, 'approved')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve & Publish
                            </button>
                            <button
                              onClick={() => handlePostStatus(post.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 font-bold text-xs flex items-center gap-1 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* All Live Posts */}
              {postsSubTab === 'live' && (
                <>
                  {(() => {
                    const livePosts = allPosts.filter(p => p.status === 'approved' || !p.status);
                    return livePosts.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        No live posts yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {livePosts.map((post) => (
                          <div key={post.id} className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {post.title}
                                </span>
                                {post.is_pinned && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                    📌 PINNED
                                  </span>
                                )}
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                  {post.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>By <strong>{post.author_name}</strong> ({post.author_role})</span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleString()}</span>
                                <span>•</span>
                                <span>❤ {post.likes || 0} likes • 💬 {post.comments_count || 0} comments</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                              <button
                                onClick={() => handlePostStatus(post.id, 'rejected')}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <X className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Rejected Posts */}
              {postsSubTab === 'rejected' && (
                <>
                  {(() => {
                    const rejectedPosts = allPosts.filter(p => p.status === 'rejected');
                    return rejectedPosts.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        No rejected posts.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {rejectedPosts.map((post) => (
                          <div key={post.id} className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {post.title}
                                </span>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                  REJECTED
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                  {post.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span>By <strong>{post.author_name}</strong></span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                              <button
                                onClick={() => handlePostStatus(post.id, 'approved')}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Re-approve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {/* TAB 1: MODERATION QUEUE */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Live Campus Safety & Content Moderation Desk
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review posts, comments, or items reported by students for spam, cheating, or abusive behavior.
                  </p>
                </div>
                <Link
                  href="/admin/reports"
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Full Moderation Archive →
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All caught up! No reports pending moderation.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports.map((r) => (
                    <div key={r.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {r.item_title || `${r.item_type} Report`}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            r.status === 'pending'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {r.reason.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Status: <strong className="uppercase">{r.status}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {r.details || 'Flagged by student peer.'}
                        </p>
                      </div>

                      {r.status === 'pending' ? (
                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                          <button
                            onClick={() => handleResolveReport(r.id, 'resolved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Take Action & Resolve
                          </button>
                          <button
                            onClick={() => handleResolveReport(r.id, 'dismissed')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            Dismiss
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          Moderated
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAST PAPERS APPROVAL DESK */}
          {activeTab === 'papers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Faculty Examination Verification Desk
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verify student-uploaded past examination papers and notes before releasing them to the campus resource portal.
                  </p>
                </div>
                <Link
                  href="/admin/past-papers"
                  className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                >
                  Manage All Papers →
                </Link>
              </div>

              {pendingPapers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All submitted exam papers have been verified and approved!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pendingPapers.map((paper) => (
                    <div key={paper.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {paper.subject_name} ({paper.subject_code})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            {paper.exam_type.toUpperCase()} {paper.year}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Uploaded by {paper.uploader_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          File: {paper.file_name} • {(paper.file_size_kb / 1024).toFixed(1)} MB
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                        <button
                          onClick={() => handlePaperStatus(paper.id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve for Library
                        </button>
                        <button
                          onClick={() => handlePaperStatus(paper.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 font-bold text-xs flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENT DIRECTORY & SUSPENSION */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Enrolled Student Account Management
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage student status, inspect department profiles, or enforce temporary campus disciplinary suspensions.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={async () => {
                      setSyncingStudents(true);
                      await UniMateStore.syncProfiles();
                      setSyncingStudents(false);
                      showNotice('Student directory synchronized with university database.');
                    }}
                    disabled={syncingStudents}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
                    title="Refresh student list from database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${syncingStudents ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by Reg #, Name, Email, Dept..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((st) => {
                  const studentPosts = UniMateStore.getPosts('admin').filter((p) => p.author_id === st.id);
                  const studentQuestions = UniMateStore.getQuestions().filter((q) => q.author_id === st.id);

                  return (
                    <div key={st.id} className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0 shadow-xs">
                          {st.avatar_url ? (
                            <img src={st.avatar_url} alt={st.full_name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            st.full_name.charAt(0)
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{st.full_name}</span>
                            
                            {/* Monospace Registration Number Badge */}
                            {st.reg_no ? (
                              <span className="inline-flex items-center gap-0.5 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                                <Hash className="w-2.5 h-2.5 text-indigo-500" />
                                {st.reg_no}
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 italic">
                                No Reg #
                              </span>
                            )}

                            {/* Anonymity Status Badge */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                              st.is_anonymous
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                              {st.is_anonymous ? <Lock className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                              <span>{st.is_anonymous ? 'Anonymous to Peers' : 'Public Profile'}</span>
                            </span>

                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              st.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : st.role === 'moderator'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}>
                              {st.role}
                            </span>
                            
                            {st.is_suspended ? (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 uppercase">
                                Suspended
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                Active
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                            <span className="font-mono text-slate-600 dark:text-slate-400">{st.email}</span>
                            <span>•</span>
                            <span>{st.program || 'Degree Student'} {st.semester ? `(Sem ${st.semester})` : ''}</span>
                            <span>•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {studentPosts.length} posts • {studentQuestions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* Dossier Quick Inspect Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForDossier(st)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition flex items-center gap-1.5 shadow-xs"
                          title="Inspect Complete Student Dossier"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" />
                          <span>View Full Dossier</span>
                        </button>

                        {isAdmin ? (
                          <>
                            {st.role === 'student' ? (
                              <button
                                onClick={() => handleRoleChange(st.id, 'moderator', st.full_name)}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 transition"
                              >
                                Make Moderator
                              </button>
                            ) : st.role === 'moderator' ? (
                              <button
                                onClick={() => handleRoleChange(st.id, 'student', st.full_name)}
                                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition"
                              >
                                Demote to Student
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleToggleSuspend(st.id, st.full_name)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                                st.is_suspended
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600'
                              }`}
                            >
                              <UserX className="w-3.5 h-3.5" />
                              {st.is_suspended ? 'Reinstate' : 'Suspend'}
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                            Admin Authorization Required
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: BROADCAST CAMPUS ANNOUNCEMENT */}
          {activeTab === 'broadcast' && (
            <div className="max-w-2xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-600" />
                  Official Campus Broadcast Channel
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Broadcast an emergency notification or university announcement that appears on all student feeds with verified Dean signature.
                </p>
              </div>

              {broadcastSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Announcement successfully broadcasted across campus feeds!
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm Examination Schedule Released or Library Maintenance Notice"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Details & Instructions
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter comprehensive instructions, dates, requirements, or link references for university students..."
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-600/20 transition"
                >
                  <Send className="w-4 h-4" />
                  Send Campus-Wide Broadcast
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* 4. QUICK ADMINISTRATION LINKS */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>KFUEIT Administration Controls</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Configure platform policies, email domain restrictions, and academic department registries.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Link
            href="/admin/settings"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            System Settings
          </Link>
          <Link
            href="/admin/academic"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Academic Catalog
          </Link>
        </div>
      </div>

      {/* 5. COMPLETE STUDENT DOSSIER MODAL (ADMIN ONLY) */}
      {selectedStudentForDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                  {selectedStudentForDossier.avatar_url ? (
                    <img
                      src={selectedStudentForDossier.avatar_url}
                      alt={selectedStudentForDossier.full_name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    selectedStudentForDossier.full_name.charAt(0)
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedStudentForDossier.full_name}
                    </h2>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedStudentForDossier.role === 'admin'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : selectedStudentForDossier.role === 'moderator'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}>
                      {selectedStudentForDossier.role}
                    </span>
                    {selectedStudentForDossier.is_suspended ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 uppercase">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active Account
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    KFUEIT Student Dossier • Verified Academic Profile
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForDossier(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Registration Number & Key Identifier Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-indigo-50/50 to-emerald-50/40 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Official Registration Number (Roll #)
                </span>
                <div className="text-base sm:text-lg font-mono font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-indigo-500" />
                  <span>{selectedStudentForDossier.reg_no || 'Pending Administrative Assignment'}</span>
                </div>
              </div>

              {/* Anonymity Status Pill */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                selectedStudentForDossier.is_anonymous
                  ? 'bg-amber-100/70 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                  : 'bg-emerald-100/70 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              }`}>
                {selectedStudentForDossier.is_anonymous ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                <span>{selectedStudentForDossier.is_anonymous ? 'Anonymous to Peers' : 'Public Profile'}</span>
              </div>
            </div>

            {/* Complete Data Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-500" /> University Email
                </span>
                <div className="font-mono text-slate-800 dark:text-slate-100 font-semibold break-all">
                  {selectedStudentForDossier.email}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-indigo-500" /> Program & Semester
                </span>
                <div className="text-slate-800 dark:text-slate-100 font-semibold">
                  {selectedStudentForDossier.program || 'Degree Student'} {selectedStudentForDossier.semester ? `• Semester ${selectedStudentForDossier.semester}` : ''}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Building className="w-3 h-3 text-indigo-500" /> Academic Department
                </span>
                <div className="text-slate-800 dark:text-slate-100 font-semibold">
                  {selectedStudentForDossier.department_name || 'Academic Commons'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" /> Account Created
                </span>
                <div className="text-slate-800 dark:text-slate-100 font-semibold">
                  {new Date(selectedStudentForDossier.created_at).toLocaleString()}
                </div>
              </div>

            </div>

            {/* Privacy Policy & Visibility Transparency Card */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Anonymity & Faculty Accountability Policy</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedStudentForDossier.is_anonymous ? (
                  <>
                    This student has enabled <strong>Anonymous Mode</strong>. Other regular students only see their display name or <em>"Anonymous Student"</em> without registration number or email. As campus administrator, you have complete unmasked access to this full dossier for security and verification purposes.
                  </>
                ) : (
                  <>
                    This student maintains a <strong>Public Profile</strong>. Basic academic details are visible to fellow student peers across campus feeds.
                  </>
                )}
              </p>
            </div>

            {/* Authored Activity Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Recent Authored Posts by Student ({UniMateStore.getPosts('admin').filter((p) => p.author_id === selectedStudentForDossier.id).length})
              </h4>
              {UniMateStore.getPosts('admin').filter((p) => p.author_id === selectedStudentForDossier.id).length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center text-slate-400 text-xs">
                  No community posts created yet by this student.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {UniMateStore.getPosts('admin')
                    .filter((p) => p.author_id === selectedStudentForDossier.id)
                    .map((p) => (
                      <div key={p.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 dark:text-slate-100">{p.title}</div>
                          <div className="text-[10px] text-slate-400">
                            Category: {p.category} • {new Date(p.created_at).toLocaleDateString()} {p.is_anonymous ? '• [Posted Anonymously]' : ''}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status || 'approved'}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Administrative Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isAdmin && (
                  <>
                    {selectedStudentForDossier.role === 'student' ? (
                      <button
                        type="button"
                        onClick={() => {
                          handleRoleChange(selectedStudentForDossier.id, 'moderator', selectedStudentForDossier.full_name);
                          setSelectedStudentForDossier({ ...selectedStudentForDossier, role: 'moderator' });
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 transition"
                      >
                        Promote to Moderator
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleRoleChange(selectedStudentForDossier.id, 'student', selectedStudentForDossier.full_name);
                          setSelectedStudentForDossier({ ...selectedStudentForDossier, role: 'student' });
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                      >
                        Demote to Student
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleToggleSuspend(selectedStudentForDossier.id, selectedStudentForDossier.full_name);
                        setSelectedStudentForDossier({
                          ...selectedStudentForDossier,
                          is_suspended: !selectedStudentForDossier.is_suspended
                        });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        selectedStudentForDossier.is_suspended
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600'
                      }`}
                    >
                      {selectedStudentForDossier.is_suspended ? 'Reinstate Account' : 'Suspend Account'}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForDossier(null)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition shadow-xs"
              >
                Done Inspecting
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. ADMIN PROFILE EDIT MODAL */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60">
                  <User className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Edit Admin Profile</h2>
                  <p className="text-[11px] text-slate-500">Update your photo, name, title, and bio</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {profileSaveMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {profileSaveMsg}
              </div>
            )}

            <form onSubmit={handleSaveAdminProfile} className="space-y-4">
              {/* Avatar Preview & Upload */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-amber-400/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-300 font-black text-2xl flex items-center justify-center ring-4 ring-amber-400/30 shadow-lg">
                      {editFullName?.charAt(0) || user?.full_name?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400">Max 5MB • JPG, PNG, WebP</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Role Title / Program */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Title
                </label>
                <input
                  type="text"
                  value={editProgram}
                  onChange={(e) => setEditProgram(e.target.value)}
                  placeholder="e.g. Campus Dean & Platform Administrator"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / About
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="A short bio about yourself..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 shadow-md shadow-amber-600/20 transition flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
