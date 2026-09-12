'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UniMateStore } from '@/lib/store';
import { Notification } from '@/types/database';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      setNotifications(UniMateStore.getNotifications(user.id));
    };
    load();
    return UniMateStore.subscribe(load);
  }, [user]);

  const handleMarkRead = (id: string) => {
    UniMateStore.markNotificationRead(id);
  };

  const handleMarkAllRead = () => {
    if (!user) return;
    UniMateStore.markAllNotificationsRead(user.id);
  };

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <p className="text-xs text-slate-500">Sign in to view your campus notifications.</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'accepted_answer':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'answer':
        return <HelpCircle className="w-5 h-5 text-indigo-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'announcement':
        return <ShieldCheck className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600" />
            <span>Campus Activity Notifications</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Stay notified about responses to your questions, discussions, and academic alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any notifications right now. Check back after participating in Q&A discussions."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                notif.is_read
                  ? 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/80 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                  {getIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {notif.title}
                    </h3>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                href={notif.link}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
