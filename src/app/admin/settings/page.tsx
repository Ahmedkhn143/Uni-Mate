'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ArrowLeft, Save, CheckCircle2, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { SystemSettings } from '@/types/database';

import { AdminAccessDenied } from '@/components/ui/AdminAccessDenied';

export default function AdminSettingsPage() {
  const { isAdmin, isModerator, isModeratorOrAdmin } = useAuth();
  
  const [settings, setSettings] = useState<SystemSettings>(UniMateStore.getSettings());
  const [universityName, setUniversityName] = useState(settings.university_name);
  const [domainsInput, setDomainsInput] = useState(settings.allowed_email_domains.join(', '));
  const [maxUploadMb, setMaxUploadMb] = useState(settings.max_upload_size_mb);
  const [maintenance, setMaintenance] = useState(settings.maintenance_mode);
  const [banner, setBanner] = useState(settings.announcement_banner || '');
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = UniMateStore.getSettings();
    setSettings(s);
    setUniversityName(s.university_name);
    setDomainsInput(s.allowed_email_domains.join(', '));
    setMaxUploadMb(s.max_upload_size_mb);
    setMaintenance(s.maintenance_mode);
    setBanner(s.announcement_banner || '');
  }, []);

  if (!isModeratorOrAdmin) {
    return <AdminAccessDenied />;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const domains = domainsInput
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const updated = UniMateStore.updateSettings({
      university_name: universityName.trim(),
      allowed_email_domains: domains.length > 0 ? domains : ['kfueit.edu.pk'],
      max_upload_size_mb: Number(maxUploadMb),
      maintenance_mode: maintenance,
      announcement_banner: banner.trim() || undefined
    });

    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Suite
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          System & Domain Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure institutional email domain verification, campus announcements, and file upload parameters.
        </p>
      </div>

      {isModerator && !isAdmin && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-semibold flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span><strong>Moderator Mode (Read-Only):</strong> System settings can only be altered by Super Admin.</span>
        </div>
      )}

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System configuration updated and applied globally!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
        
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            University / Institution Name
          </label>
          <input
            type="text"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Approved University Email Domains (Comma Separated)
          </label>
          <input
            type="text"
            value={domainsInput}
            onChange={(e) => setDomainsInput(e.target.value)}
            placeholder="kfueit.edu.pk"
            required
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Students attempting registration must provide an email ending in one of these domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Max Resource Upload Size (MB)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxUploadMb}
              onChange={(e) => setMaxUploadMb(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="maintenance"
              checked={maintenance}
              onChange={(e) => setMaintenance(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="maintenance" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              Maintenance Mode (Read-only for students)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Global Campus Announcement Banner (Optional)
          </label>
          <textarea
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            rows={2}
            placeholder="📢 E.g. Library hours extended during midterm week until 2 AM."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition"
          >
            <Save className="w-4 h-4" />
            Save System Settings
          </button>
        </div>

      </form>

    </div>
  );
}
