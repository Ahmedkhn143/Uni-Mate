'use client';

import React, { useState, useRef } from 'react';
import { Flag, X, AlertTriangle, CheckCircle2, UploadCloud, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react';
import { ReportReason } from '@/types/database';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'question' | 'answer' | 'post' | 'lost_found' | 'paper' | 'user';
  itemId: string;
  itemTitle?: string;
}

const REASONS: { value: ReportReason; label: string; desc: string }[] = [
  { value: 'spam', label: 'Spam or Commercial Promotion', desc: 'Irrelevant advertisements or bot content' },
  { value: 'harassment', label: 'Harassment or Bullying', desc: 'Attacking, insulting, or targeting individuals' },
  { value: 'fake_information', label: 'Fake or Misleading Info', desc: 'Fabricated academic data, fraudulent dates, or scams' },
  { value: 'inappropriate_content', label: 'Inappropriate Content', desc: 'Explicit, vulgar, or offensive campus material' },
  { value: 'copyright_issue', label: 'Copyright or Honor Code Violation', desc: 'Unauthorized sharing of copyrighted textbook material' },
  { value: 'other', label: 'Other Issue', desc: 'Violates campus community guidelines' }
];

export function ReportModal({ isOpen, onClose, itemType, itemId, itemTitle }: ReportModalProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEvidenceError('');

    if (!file.type.startsWith('image/')) {
      setEvidenceError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setEvidenceError('Image evidence exceeds 1 MB limit. Please choose a smaller image.');
      return;
    }

    setUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'reports-evidence');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload evidence');
      }

      setEvidenceUrl(data.url);
    } catch (err: any) {
      setEvidenceError(err?.message || 'Could not upload evidence image. You may also paste an image URL directly.');
    } finally {
      setUploadingEvidence(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to report content.');
      return;
    }
    if (!details.trim()) {
      setError('Please provide specific details for the moderation team.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      UniMateStore.submitReport({
        reporter: user,
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle || `${itemType.toUpperCase()} item #${itemId.slice(0, 8)}`,
        reason: selectedReason,
        details: details.trim(),
        evidence_url: evidenceUrl.trim() || undefined
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        setEvidenceUrl('');
        onClose();
      }, 1800);
    } catch {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Report Submitted for Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Thank you for keeping UniMate safe. The campus moderation team has received your report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <Flag className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Report Inappropriate Content
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reporting: <span className="font-semibold text-slate-700 dark:text-slate-300">{itemTitle || itemType}</span>
            </p>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Reason for reporting:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedReason === r.value
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={selectedReason === r.value}
                      onChange={() => setSelectedReason(r.value)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="font-bold">{r.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Supporting Evidence Upload (Max 1MB) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Supporting Evidence / Screenshot <span className="text-slate-400 font-normal">(Optional, Max 1 MB)</span>
              </label>

              {evidenceError && (
                <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{evidenceError}</p>
              )}

              {evidenceUrl ? (
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={evidenceUrl}
                      alt="Uploaded evidence"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="truncate text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Evidence Attached</p>
                      <a href={evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline truncate block">
                        View Image Link
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEvidenceUrl('')}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    title="Remove evidence"
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
                      disabled={uploadingEvidence}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                    >
                      {uploadingEvidence ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      ) : (
                        <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                      <span>{uploadingEvidence ? 'Uploading...' : 'Upload Image Evidence (Max 1 MB)'}</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEvidenceUpload}
                      className="hidden"
                    />
                  </div>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Additional Details:
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe what is problematic with this content..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
