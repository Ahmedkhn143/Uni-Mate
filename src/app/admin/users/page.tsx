'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserX, 
  CheckCircle2, 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  RefreshCw, 
  Trash2, 
  Eye, 
  X, 
  Building, 
  Calendar, 
  Hash, 
  BookOpen, 
  Shield 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Profile } from '@/types/database';
import { AdminAccessDenied } from '@/components/ui/AdminAccessDenied';

export default function AdminUsersPage() {
  const { isAdmin, isModerator, isModeratorOrAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const fetchUsers = async (showToast = false) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          setProfiles(data.users);
          UniMateStore.setProfiles(data.users);
          if (showToast) {
            setToastMsg(`Synchronized ${data.users.length} registered students from database.`);
            setTimeout(() => setToastMsg(null), 3500);
          }
          return;
        }
      }
      // Fallback to in-memory store
      setProfiles([...UniMateStore.getProfiles()]);
    } catch (err) {
      console.error('Failed to sync students from API:', err);
      setProfiles([...UniMateStore.getProfiles()]);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Initial direct fetch from server
    fetchUsers(false);

    // Keep store in sync
    const unsubscribe = UniMateStore.subscribe(() => {
      setProfiles([...UniMateStore.getProfiles()]);
    });

    const interval = setInterval(() => {
      fetchUsers(false);
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  if (!isModeratorOrAdmin) {
    return <AdminAccessDenied />;
  }

  const handleToggleSuspend = (userId: string) => {
    if (!isAdmin) return;
    const target = profiles.find((p) => p.id === userId);
    const newStatus = UniMateStore.toggleUserSuspension(userId);
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, is_suspended: newStatus } : p))
    );
    const name = target?.full_name || 'User';
    setToastMsg(newStatus ? `Account suspended for ${name}.` : `Account restored for ${name}.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleRoleChange = (userId: string, newRole: 'student' | 'moderator') => {
    if (!isAdmin) return;
    const target = profiles.find((p) => p.id === userId);
    UniMateStore.updateUserRole(userId, newRole);
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
    );
    const name = target?.full_name || 'User';
    setToastMsg(`Role updated to ${newRole === 'moderator' ? 'Moderator' : 'Student'} for ${name}.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    const target = profiles.find((p) => p.id === userId);
    const name = target?.full_name || 'Student';
    if (!window.confirm(`Are you sure you want to permanently remove ${name} (${target?.email})? This action cannot be undone.`)) {
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    await UniMateStore.deleteUser(userId);
    setToastMsg(`Account for ${name} has been permanently deleted.`);
    setTimeout(() => setToastMsg(null), 3500);
    // Refresh to guarantee sync with serverless DB
    setTimeout(() => {
      fetchUsers(false);
    }, 500);
  };

  const filtered = profiles.filter(
    (p) => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}
      
      {/* Header */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Suite
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              <span>Student Directory</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {profiles.filter((p) => p.role !== 'admin').length} registered student{profiles.filter((p) => p.role !== 'admin').length === 1 ? '' : 's'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage student accounts, review campus roles, and suspend accounts that violate the honor code.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fetchUsers(true)}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer disabled:opacity-50"
              title="Refresh student list from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md overflow-hidden">
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Student / User</th>
                <th className="p-4">Roll # / Reg ID</th>
                <th className="p-4">Department & Degree</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.full_name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {u.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700">
                      {u.reg_no || u.student_id || 'Pending'}
                    </span>
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{u.program || 'BS Computer Science'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {u.department_name || 'Department of Computer Science & IT'} • <span className="font-semibold text-indigo-600 dark:text-indigo-400">Semester {u.semester || 1}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : u.role === 'moderator' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                        <ShieldCheck className="w-3 h-3" /> Moderator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                        <GraduationCap className="w-3 h-3" /> Student
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {u.is_suspended ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        Active & Verified
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Details Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                        title="View Full Profile Details"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Details</span>
                      </button>

                      {isAdmin && (
                        <>
                          {u.role === 'student' ? (
                            <button
                              onClick={() => handleRoleChange(u.id, 'moderator')}
                              className="px-2 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 transition"
                              title="Promote to Moderator"
                            >
                              Make Mod
                            </button>
                          ) : u.role === 'moderator' ? (
                            <button
                              onClick={() => handleRoleChange(u.id, 'student')}
                              className="px-2 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                              title="Demote to Student"
                            >
                              Demote
                            </button>
                          ) : null}

                          {u.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleSuspend(u.id)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                                  u.is_suspended
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {u.is_suspended ? 'Restore' : 'Suspend'}
                              </button>

                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                title="Permanently Remove Student"
                                className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {filtered.map((u) => (
            <div key={u.id} className="p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} alt={u.full_name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {u.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{u.full_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                      Roll: {u.reg_no || u.student_id || 'Pending'}
                    </span>
                  </div>
                </div>

                <div>
                  {u.role === 'admin' ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Student
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                <span>{u.program || 'BS Computer Science'} (Sem {u.semester || 1})</span>
                {u.is_suspended ? (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                    Suspended
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(u)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition text-center flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>View Details</span>
                </button>

                {isAdmin && u.role !== 'admin' && (
                  <>
                    <button
                      onClick={() => handleToggleSuspend(u.id)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition text-center ${
                        u.is_suspended
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}
                    >
                      {u.is_suspended ? 'Restore' : 'Suspend'}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      title="Permanently Remove Student"
                      className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {search ? 'No matching students found' : 'No students registered yet'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                {search
                  ? `No student matches "${search}". Try searching by a different name or email.`
                  : 'New students will automatically appear here once they complete registration and verify their university email OTP.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT PROFILE & DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div className="flex items-center gap-4">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md">
                    {selectedUser.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {selectedUser.full_name}
                    </h2>
                    {selectedUser.role === 'admin' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        Super Admin
                      </span>
                    ) : selectedUser.role === 'moderator' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Campus Moderator
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Verified Student
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {selectedUser.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {selectedUser.is_suspended ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
                        Account Suspended
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                        Active & In Good Standing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Detailed Student Attributes */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Roll Number */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Hash className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Roll Number / Reg ID</span>
                  </div>
                  <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {selectedUser.reg_no || selectedUser.student_id || 'Not Assigned'}
                  </p>
                </div>

                {/* Department */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Department</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedUser.department_name || 'Department of Computer Science & IT'}
                  </p>
                </div>

                {/* Degree Program */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Degree Program</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {selectedUser.program || 'BS Computer Science'}
                  </p>
                </div>

                {/* Current Semester */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Current Semester</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Semester {selectedUser.semester || 1}
                  </p>
                </div>

                {/* Registration Date */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Registration Date</span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    {new Date(selectedUser.created_at || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Account UUID */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Supabase Auth ID</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                    {selectedUser.id}
                  </p>
                </div>
              </div>

              {/* Bio / Description */}
              {selectedUser.bio && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Student Bio</span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                {isAdmin && selectedUser.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                      setSelectedUser(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && selectedUser.role !== 'admin' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleSuspend(selectedUser.id);
                        setSelectedUser((prev) => prev ? { ...prev, is_suspended: !prev.is_suspended } : null);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        selectedUser.is_suspended
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {selectedUser.is_suspended ? 'Restore Account' : 'Suspend Account'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newRole = selectedUser.role === 'moderator' ? 'student' : 'moderator';
                        handleRoleChange(selectedUser.id, newRole);
                        setSelectedUser((prev) => prev ? { ...prev, role: newRole } : null);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300 transition"
                    >
                      {selectedUser.role === 'moderator' ? 'Demote to Student' : 'Promote to Moderator'}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
