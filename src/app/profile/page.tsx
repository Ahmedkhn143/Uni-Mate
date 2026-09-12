'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  Award, 
  Edit3, 
  Save, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';

export default function ProfilePage() {
  const { user, updateCurrentUserProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [semester, setSemester] = useState(user?.semester || 1);
  const [program, setProgram] = useState(user?.program || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Student Profile</h2>
        <p className="text-xs text-slate-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  // Count user's contributions
  const questions = UniMateStore.getQuestions().filter((q) => q.author_id === user.id);
  const lostFound = UniMateStore.getLostFoundItems().filter((item) => item.author_id === user.id);
  const bookmarks = UniMateStore.getBookmarks(user.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      full_name: fullName.trim(),
      bio: bio.trim(),
      semester: Number(semester),
      program: program.trim(),
      avatar_url: avatarUrl.trim() || undefined
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Profile Header Card */}
      <div className="p-4 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
                {user.full_name.charAt(0)}
              </div>
            )}
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  {user.full_name}
                </h1>
                {user.role === 'admin' && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Campus Moderator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                <span>{user.program}</span>
                <span>•</span>
                <span>Semester {user.semester || 1}</span>
                {user.student_id && (
                  <>
                    <span>•</span>
                    <span className="text-slate-400">ID: {user.student_id}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        {/* Bio */}
        {!isEditing ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Student Bio:</span>
            {user.bio || 'No bio entered yet. Click "Edit Profile" to add your coursework interests and bio.'}
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Edit Profile Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Degree Program</label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Current Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </form>
        )}

        {/* Contribution Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2 text-center">
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">{questions.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Questions Asked</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{lostFound.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Lost & Found Posts</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="text-xl font-black text-purple-600 dark:text-purple-400">{bookmarks.length}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Saved Items</div>
          </div>
        </div>

      </div>

    </div>
  );
}
