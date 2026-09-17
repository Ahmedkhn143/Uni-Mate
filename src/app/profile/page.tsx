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
  X,
  Hash,
  Lock,
  Globe
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
  const [program, setProgram] = useState(user?.program || '');
  const [regNo, setRegNo] = useState(user?.reg_no || user?.student_id || '');
  const [isAnonymous, setIsAnonymous] = useState(user?.is_anonymous || false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setSemester(user.semester || 1);
      setProgram(user.program || '');
      setRegNo(user.reg_no || user.student_id || '');
      setIsAnonymous(user.is_anonymous || false);
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');
    const resolvedProg = program.trim() || 'BS Computer Science';

    await updateCurrentUserProfile({
      full_name: fullName.trim(),
      bio: bio.trim(),
      semester: Number(semester),
      program: resolvedProg,
      reg_no: regNo.trim() || undefined,
      student_id: regNo.trim() || undefined,
      is_anonymous: isAnonymous,
      avatar_url: avatarPreview || undefined
    });

    setSaving(false);
    setSaveSuccessMsg('Profile updated successfully!');
    setTimeout(() => {
      setIsEditing(false);
      setSaveSuccessMsg('');
    }, 700);
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

              {/* Badges for Registration Number and Anonymity */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {user.reg_no ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300">
                    <Hash className="w-3 h-3 text-indigo-500" />
                    <span>Reg #: {user.reg_no}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <span>+ Add Reg #</span>
                  </button>
                )}

                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${
                  user.is_anonymous
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {user.is_anonymous ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  <span>{user.is_anonymous ? 'Anonymous Mode Active (Peers only see name)' : 'Public Profile'}</span>
                </span>
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
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Degree Program <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="e.g. Computer Science, Cyber Security, etc."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Registration Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono select-none">#</span>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  placeholder="e.g. BSCS-2022-45 or 2022-CS-0045"
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Anonymous Mode Toggle */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsAnonymous((prev) => !prev)}
                className={`relative shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isAnonymous ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    isAnonymous ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="space-y-0.5">
                <label
                  onClick={() => setIsAnonymous((prev) => !prev)}
                  className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-indigo-500" />
                  <span>Post Anonymously by Default</span>
                </label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  When enabled, other students only see your name or <strong>"Anonymous Student"</strong>; your registration number & email remain strictly hidden. Admins always see complete details for campus safety.
                </p>
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

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              {saveSuccessMsg && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveSuccessMsg}
                </span>
              )}
            </div>
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
