'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PackageSearch, 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  MessageSquare,
  AlertCircle,
  Send,
  Upload
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { ItemCategory, LostFoundType } from '@/types/database';

const CATEGORIES: ItemCategory[] = [
  'ID/Card', 'Wallet', 'Keys', 'Books', 'Electronics', 
  'Documents', 'Clothing', 'Accessories', 'Other'
];

function CreateLostFoundContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [type, setType] = useState<LostFoundType>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [contactInfo, setContactInfo] = useState('');
  const [contactPreference, setContactPreference] = useState<'in_app' | 'email' | 'phone'>('in_app');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      setError('Photo size exceeds the maximum limit of 1 MB. Please choose an image under 1 MB or compress it.');
      e.target.value = '';
      return;
    }

    setError('');
    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'lost-found');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || 'Failed to upload photo.');
      }
    } catch (err) {
      console.error('Image upload failed', err);
      setError('An error occurred while uploading photo.');
    } finally {
      setUploadingImg(false);
    }
  };

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'found') setType('found');
    else if (typeParam === 'lost') setType('lost');

    if (user) {
      setContactInfo(user.email);
    }
  }, [searchParams, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to report a lost or found item.');
      return;
    }
    if (user.is_suspended) {
      setError('Your account is suspended. You cannot post items.');
      return;
    }
    if (!title.trim() || title.length < 5) {
      setError('Please provide a specific item title.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify the campus location.');
      return;
    }
    if (!contactInfo.trim()) {
      setError('Please specify how the student can reach you.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const newItem = UniMateStore.createLostFoundItem({
        author: user,
        type,
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        event_date: eventDate,
        contact_info: contactInfo.trim(),
        contact_preference: contactPreference,
        image_url: imageUrl.trim() || undefined
      });

      router.push(`/lost-and-found/${newItem.id}`);
    } catch {
      setError('Failed to create post. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <Link
          href="/lost-and-found"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Lost & Found
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <PackageSearch className="w-6 h-6 text-emerald-600" />
          Report Lost or Found Campus Item
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provide accurate details to ensure items are quickly returned to their rightful owners.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-5">
        
        {/* Type Toggle: LOST vs FOUND */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
            Listing Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`py-3 px-4 rounded-2xl font-bold text-xs border transition ${
                type === 'lost'
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-700 dark:text-red-300 ring-2 ring-red-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100'
              }`}
            >
              I LOST SOMETHING
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`py-3 px-4 rounded-2xl font-bold text-xs border transition ${
                type === 'found'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100'
              }`}
            >
              I FOUND AN ITEM
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Item Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'lost' ? 'e.g. Black Casio fx-991EX Scientific Calculator' : 'e.g. Student ID Card (Blue Lanyard)'}
            required
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Date {type === 'lost' ? 'Lost' : 'Discovered'} *
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Campus Location */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Campus Location *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library 2nd Floor or Auditorium B Row 4"
              required
              className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Detailed Description & Identifying Marks *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Mention color, brand, stickers, serial suffix, or condition..."
            required
            className="w-full p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Contact Method & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Preferred Contact Channel
            </label>
            <select
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            >
              <option value="in_app">UniMate In-App Messaging</option>
              <option value="email">University Email</option>
              <option value="phone">Phone / WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Contact Detail
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. Message me on UniMate or student@kfueit.edu.pk"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Item Photo (Uploaded to Cloudflare 10 GB Storage) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
            Item Photo (Uploaded to Cloudflare 10 GB Storage)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center mb-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingImg ? 'Uploading to Cloudflare...' : 'Upload Photo'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImg} className="hidden" />
            </label>
            <span className="text-[11px] text-slate-400">or enter image link below (JPG/PNG • Max 1 MB)</span>
          </div>
          <div className="relative">
            <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... or choose photo above"
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          {imageUrl && (
            <div className="mt-2.5 flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <img src={imageUrl} alt="Item Preview" className="h-14 w-14 object-cover rounded-lg border border-slate-200" />
              <div className="text-[11px] text-slate-500 truncate flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Photo Attached</p>
                <p className="truncate text-[10px] text-emerald-600 dark:text-emerald-400">{imageUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="text-xs text-red-500 hover:underline px-2"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Link
            href="/lost-and-found"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Publishing Report...' : 'Publish Report'}
          </button>
        </div>

      </form>

    </div>
  );
}

export default function CreateLostFoundPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form...</div>}>
      <CreateLostFoundContent />
    </Suspense>
  );
}
