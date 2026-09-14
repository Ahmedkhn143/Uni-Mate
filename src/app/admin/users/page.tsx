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
  RefreshCw
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

  useEffect(() => {
    const load = () => {
      setProfiles(UniMateStore.getProfiles());
    };
    load();
    UniMateStore.syncProfiles();
    const unsubscribe = UniMateStore.subscribe(load);

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

  const handleToggleSuspend = (userId: string) => {
    if (!isAdmin) return;
    UniMateStore.toggleUserSuspension(userId);
  };

  const handleRoleChange = (userId: string, newRole: 'student' | 'moderator') => {
    if (!isAdmin) return;
    UniMateStore.updateUserRole(userId, newRole);
  };

  const filtered = profiles.filter(
    (p) => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
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
              Student & Faculty Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage student accounts, review campus roles, and suspend accounts that violate the honor code.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={async () => {
                setSyncing(true);
                await UniMateStore.syncProfiles();
                setSyncing(false);
              }}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
              title="Refresh student list from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${syncing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
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
                        <img src={u.avatar_url} alt={u.full_name} className="w-8 h-8 rounded-xl object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                          {u.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div className="font-medium">{u.program || 'General Program'}</div>
                    <div className="text-[10px] text-slate-400">Semester {u.semester || 1}</div>
                  </td>

                  <td className="p-4">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <ShieldCheck className="w-3 h-3" /> Admin
                      </span>
                    ) : u.role === 'moderator' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        <ShieldCheck className="w-3 h-3" /> Moderator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        <GraduationCap className="w-3 h-3" /> Student
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {u.is_suspended ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Suspended
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active & Good Standing
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        {u.role === 'student' ? (
                          <button
                            onClick={() => handleRoleChange(u.id, 'moderator')}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 transition"
                          >
                            Make Moderator
                          </button>
                        ) : u.role === 'moderator' ? (
                          <button
                            onClick={() => handleRoleChange(u.id, 'student')}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition"
                          >
                            Demote to Student
                          </button>
                        ) : null}

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleSuspend(u.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                              u.is_suspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {u.is_suspended ? 'Restore' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Admin Only Action
                      </span>
                    )}
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
                    <img src={u.avatar_url} alt={u.full_name} className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {u.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{u.full_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
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
                <span>{u.program || 'General Program'} (Sem {u.semester || 1})</span>
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

              {u.role !== 'admin' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleToggleSuspend(u.id)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition text-center ${
                      u.is_suspended
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300'
                    }`}
                  >
                    {u.is_suspended ? 'Restore Student Account' : 'Suspend Student Account'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
