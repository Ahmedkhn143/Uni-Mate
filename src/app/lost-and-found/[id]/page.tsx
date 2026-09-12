'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PackageSearch, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  Flag, 
  Sparkles,
  Share2,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { LostFoundItem } from '@/types/database';
import { ReportModal } from '@/components/ui/ReportModal';

export default function LostFoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const itemId = params.id as string;

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  useEffect(() => {
    const load = () => {
      const found = UniMateStore.getLostFoundById(itemId);
      if (found) setItem(found);
    };
    load();
    return UniMateStore.subscribe(load);
  }, [itemId]);

  if (!item) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Item Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested lost or found item does not exist or was removed.</p>
        <Link href="/lost-and-found" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Directory
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === item.author_id;

  const handleMarkResolved = () => {
    UniMateStore.markLostFoundResolved(item.id);
  };

  const handleStartChat = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const targetProfile = UniMateStore.getProfileById(item.author_id);
    if (!targetProfile) return;

    const conv = UniMateStore.startConversation(user, targetProfile);
    router.push(`/messages?conv=${conv.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <Link
          href="/lost-and-found"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Lost & Found
        </Link>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
        
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
                item.type === 'lost'
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              }`}
            >
              {item.type}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {item.category}
            </span>
          </div>

          {item.status === 'resolved' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" /> Reunited with Owner
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Active Listing
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
          {item.title}
        </h1>

        {/* Meta Stats: Location & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Location</span>
              <span className="font-bold">{item.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Date Reported</span>
              <span className="font-bold">{item.event_date}</span>
            </div>
          </div>
        </div>

        {/* Image if available */}
        {item.image_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-96 bg-slate-100 dark:bg-slate-800">
            <img src={item.image_url} alt={item.title} className="w-full h-auto object-contain" />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Item Description
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {item.description}
          </p>
        </div>

        {/* Author & Actions Row */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            {item.author_avatar ? (
              <img src={item.author_avatar} alt={item.author_name} className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {item.author_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Posted by {item.author_name}
              </div>
              <div className="text-[10px] text-slate-400">
                Verified Student
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Mark Resolved for Author */}
            {isAuthor && item.status === 'open' && (
              <button
                onClick={handleMarkResolved}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Mark as Reunited / Resolved
              </button>
            )}

            {/* Direct Message if not author */}
            {!isAuthor && (
              <button
                onClick={handleStartChat}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message via UniMate
              </button>
            )}

            <button
              onClick={() => setShowContactDetails(!showContactDetails)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
            >
              {showContactDetails ? 'Hide Contact' : 'Show Contact Info'}
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 rounded-xl"
              title="Report listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Contact Info Drawer */}
        {showContactDetails && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs space-y-1.5 animate-in fade-in">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200">Owner Contact Method:</h4>
            <p className="text-slate-700 dark:text-slate-300">{item.contact_info}</p>
            <p className="text-[10px] text-slate-400">
              Only verified university accounts can view this contact detail to prevent spam.
            </p>
          </div>
        )}

      </div>

      {/* Universal Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        itemType="lost_found"
        itemId={item.id}
        itemTitle={item.title}
      />

    </div>
  );
}
