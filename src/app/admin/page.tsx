'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
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
  Sparkles
} from 'lucide-react';
import { useAuth, PERMANENT_ACCOUNTS } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Report, PastPaper, Profile } from '@/types/database';
import { AdminAccessDenied } from '@/components/ui/AdminAccessDenied';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingPapers, setPendingPapers] = useState<PastPaper[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'moderation' | 'papers' | 'students' | 'broadcast'>('moderation');
  
  // Broadcast Announcement State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

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
      setProfiles(UniMateStore.getProfiles());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  if (!isAdmin) {
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

  const handleToggleSuspend = (targetUserId: string, name: string) => {
    UniMateStore.toggleUserSuspension(targetUserId);
    showNotice(`User account status updated for ${name}.`);
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
      p.role === 'student' && 
      (p.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || 
       p.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
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
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>FACULTY ADMINISTRATION & CAMPUS OPERATIONS CONSOLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dean & Administrator Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Logged in as <strong className="text-amber-300">{user?.full_name}</strong> ({PERMANENT_ACCOUNTS.ADMIN.title}). Supervise student safety, academic content approvals, account standing, and emergency broadcasts.
            </p>
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

      {/* 2. KEY METRICS CARDS */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Total Students */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">Active</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.totalStudents}</div>
            <div className="text-xs text-slate-500 font-medium">Enrolled Students</div>
          </div>

          {/* Pending Reports (Red Alert) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-red-500/40 dark:border-red-500/30 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 uppercase animate-pulse">
                Action Req.
              </span>
            </div>
            <div className="text-2xl font-black text-red-600">{stats.pendingReports}</div>
            <div className="text-xs text-slate-500 font-medium">Flagged Reports Queue</div>
          </div>

          {/* Pending Papers (Amber Alert) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/40 dark:border-amber-500/30 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-amber-600">
              <FileText className="w-5 h-5" />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Review
              </span>
            </div>
            <div className="text-2xl font-black text-amber-600">{stats.pendingPapers}</div>
            <div className="text-xs text-slate-500 font-medium">Exam Papers Pending</div>
          </div>

          {/* Academic Q&A Solved */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <HelpCircle className="w-5 h-5" />
              <span className="text-[10px] font-bold text-slate-400">{stats.totalAnswers} Answers</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.activeQuestions}</div>
            <div className="text-xs text-slate-500 font-medium">Academic Discussions</div>
          </div>

          {/* Lost & Found Reunited */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <PackageSearch className="w-5 h-5" />
              <span className="text-[10px] font-bold text-slate-400">{stats.foundItems} Found</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.lostItems}</div>
            <div className="text-xs text-slate-500 font-medium">Lost Belongings Tracked</div>
          </div>

        </div>
      )}

      {/* 3. INTERACTIVE ADMIN CONTROL TABS */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Tab Header Bar */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-4 gap-2 sm:gap-4 overflow-x-auto">
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
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student by name..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((st) => (
                  <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                        {st.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{st.full_name}</span>
                          {st.is_suspended ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 uppercase">
                              Suspended
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active Student
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500">
                          {st.email} • {st.program || 'Degree Student'} {st.semester ? `(Sem ${st.semester})` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSuspend(st.id, st.full_name)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shrink-0 ${
                        st.is_suspended
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600'
                      }`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      {st.is_suspended ? 'Reinstate Student' : 'Suspend Account'}
                    </button>
                  </div>
                ))}
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

    </div>
  );
}
