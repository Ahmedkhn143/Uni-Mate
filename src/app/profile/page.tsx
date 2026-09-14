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
  ShieldCheck,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { KFUEIT_PROGRAMS } from '@/lib/constants';

export default function ProfilePage() {
  const { user, updateCurrentUserProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [semester, setSemester] = useState(user?.semester || 1);
  const [program, setProgram] = useState(() => {
    if (!user?.program) return 'BS Computer Science';
    return (KFUEIT_PROGRAMS as readonly string[]).includes(user.program) ? user.program : 'Other';
  });
  const [customProgram, setCustomProgram] = useState(() => {
    if (!user?.program) return '';
    return (KFUEIT_PROGRAMS as readonly string[]).includes(user.program) ? '' : user.program;
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Profile photo must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
    const resolvedProg = (program === 'Other' ? customProgram : (customProgram ? `${program} (${customProgram})` : program)) || 'BS Computer Science';

    updateCurrentUserProfile({
      full_name: fullName.trim(),
      bio: bio.trim(),
      semester: Number(semester),
      program: resolvedProg.trim(),
      avatar_url: avatarPreview || undefined
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
            
            {/* Avatar Image File Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-18 h-18 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center">
                    {fullName.charAt(0) || 'U'}
                  </div>
                )}
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1 text-center sm:text-left flex-1">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Profile Photo
                </label>
                <p className="text-[11px] text-slate-500">Upload JPG, PNG or WEBP from your device (Max 5MB)</p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-sm transition">
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
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Degree Program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">Select Degree Program (Optional)</option>
                  {KFUEIT_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Specialization / Track (Optional)</label>
                <input
                  type="text"
                  value={customProgram}
                  onChange={(e) => setCustomProgram(e.target.value)}
                  placeholder="e.g. Cyber Security, AI Track"
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
