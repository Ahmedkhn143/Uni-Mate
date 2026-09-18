'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Search, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Bookmark, 
  Briefcase, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2,
  AlertTriangle,
  Building,
  UploadCloud,
  Trash2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Scholarship, OpportunityCategory } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES: OpportunityCategory[] = [
  'Scholarship', 'Internship', 'Workshop', 'Competition', 'Fellowship', 'Job', 'Other'
];

export default function ScholarshipsPage() {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'deadline_soon' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Submit Opportunity Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<OpportunityCategory>('Scholarship');
  const [newEligibility, setNewEligibility] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setImageError('Image exceeds 1 MB size limit. Please choose a smaller photo.');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'scholarships');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }
      setNewImageUrl(data.url);
    } catch (err: any) {
      setImageError(err?.message || 'Could not upload image.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const load = () => {
      setScholarships(UniMateStore.getScholarships());
    };
    load();
    return UniMateStore.subscribe(load);
  }, []);

  const handleToggleBookmark = (sch: Scholarship) => {
    if (!user) return;
    UniMateStore.toggleBookmark({
      user_id: user.id,
      item_type: 'scholarship',
      item_id: sch.id,
      title: sch.title,
      category: sch.category,
      link: '/scholarships'
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    UniMateStore.createScholarship({
      author: user || undefined,
      title: newTitle.trim(),
      organization: newOrg.trim(),
      description: newDesc.trim(),
      category: newCategory,
      eligibility: newEligibility.trim(),
      deadline: newDeadline || '2026-11-30',
      application_url: newUrl.trim(),
      image_url: newImageUrl.trim() || undefined,
      amount: newAmount.trim() || undefined,
      location: newLocation.trim() || undefined,
      status: 'open'
    });

    setNewTitle('');
    setNewOrg('');
    setNewDesc('');
    setNewUrl('');
    setNewAmount('');
    setNewImageUrl('');
    setSubmitModalOpen(false);
  };

  const isSaved = (schId: string) => {
    return user ? UniMateStore.isBookmarked(user.id, 'scholarship', schId) : false;
  };

  const filtered = scholarships.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === 'deadline_soon') matchesTab = s.status === 'closing_soon';
    if (activeTab === 'saved') matchesTab = isSaved(s.id);

    return matchesCategory && matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Scholarships & Student Opportunities</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Verified academic grants, summer engineering internships, fellowships, and startup competitions.
          </p>
        </div>

        <button
          onClick={() => setSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          Share Opportunity
        </button>
      </div>

      {/* Search Bar & Category Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by grant name, organization, or internship keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('deadline_soon')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'deadline_soon'
                ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Closing Soon
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bookmarked
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeCategory === 'all'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Types
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              activeCategory === c
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid of Listings */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No opportunities found"
          description="There are currently no listings matching your criteria."
          actionText="Share an Opportunity"
          onActionClick={() => setSubmitModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((sch) => (
            <div
              key={sch.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {sch.category}
                    </span>
                    {sch.is_verified && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Campus Verified
                      </span>
                    )}
                  </div>

                  {sch.status === 'closing_soon' ? (
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Deadline Soon
                    </span>
                  ) : sch.status === 'closed' ? (
                    <span className="text-[10px] font-semibold text-slate-400">Closed</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-600">Active</span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {sch.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {sch.organization}
                  </p>
                </div>

                {/* Flyer / Banner Image if attached */}
                {sch.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48">
                    <img src={sch.image_url} alt={sch.title} className="w-full h-36 object-cover" />
                  </div>
                )}

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {sch.description}
                </p>

                {/* Eligibility Tag */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Eligibility: </span>
                  {sch.eligibility}
                </div>
              </div>

              {/* Footer Meta & Application Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Deadline: {sch.deadline}
                  </div>
                  {sch.amount && (
                    <div className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                      {sch.amount}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBookmark(sch)}
                    className={`p-2 rounded-xl border text-xs transition ${
                      isSaved(sch.id)
                        ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950 dark:border-amber-800'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-600'
                    }`}
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>

                  <a
                    href={sch.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition"
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* SHARE OPPORTUNITY MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Share Student Opportunity</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. National Merit Engineering Grant 2026"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Organization *</label>
                  <input
                    type="text"
                    value={newOrg}
                    onChange={(e) => setNewOrg(e.target.value)}
                    placeholder="e.g. Google STEM Foundation"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as OpportunityCategory)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={newEligibility}
                  onChange={(e) => setNewEligibility(e.target.value)}
                  placeholder="e.g. Sophomore or Junior student with 3.2+ GPA"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Grant / Stipend</label>
                  <input
                    type="text"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="e.g. $5,000 or $45/hr"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Application URL *</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.org/apply"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Summary</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Key responsibilities or application requirements..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Flyer / Promotional Image Upload */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Opportunity Flyer / Banner <span className="text-slate-400 font-normal">(Optional, Max 1 MB)</span>
                </label>

                {imageError && (
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{imageError}</p>
                )}

                {newImageUrl ? (
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={newImageUrl}
                        alt="Opportunity preview"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="truncate text-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Banner Attached</p>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Ready to attach</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewImageUrl('')}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="Remove banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                        ) : (
                          <UploadCloud className="w-4 h-4 text-amber-600" />
                        )}
                        <span>{uploadingImage ? 'Uploading to R2...' : 'Upload Flyer Image (Max 1 MB)'}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Or paste banner image URL (https://...)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  Share Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
