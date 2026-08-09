'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, CheckCheck, ShieldCheck, Sparkles, Filter, Settings } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { ClubLogo } from '@/components/clubs/club-logo';
import {
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications/notification-engine';
import type { TransferNotification } from '@/types/notification';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<TransferNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  const handleMarkAsRead = (id: string) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const filteredNotifications = notifications.filter((n) => (filter === 'unread' ? !n.readAt : true));
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <Link
            href="/more/settings/notifications"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Preferences</span>
          </Link>
        </div>

        {/* Page Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                <Bell className="h-4 w-4" />
                <span>Verified Activity Center</span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
                Transfer Notifications
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl">
                Real-time verified transfer updates matching your followed teams and reliability thresholds.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 shrink-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark All Read ({unreadCount})</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                filter === 'unread' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </section>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => {
              const isRead = Boolean(item.readAt);
              return (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`group rounded-xl border p-4 transition-colors cursor-pointer ${
                    isRead
                      ? 'border-slate-800/80 bg-slate-900/60 text-slate-300'
                      : 'border-emerald-500/40 bg-slate-900 text-slate-100 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {item.clubId ? (
                      <ClubLogo clubId={item.clubId} size="sm" />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-emerald-400">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-extrabold uppercase tracking-wider ${
                            item.eventType === 'OFFICIAL'
                              ? 'text-emerald-400'
                              : item.eventType === 'AGREEMENT_REACHED'
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {item.eventType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h3 className="mt-1 font-bold text-sm text-white">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-2">
              <Bell className="mx-auto h-8 w-8 text-slate-600" />
              <h3 className="font-display text-base font-bold text-white">No transfer notifications yet.</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Follow a club or league to receive verified transfer updates directly in your notification center.
              </p>
            </div>
          )}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
