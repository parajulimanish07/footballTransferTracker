'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, ExternalLink, ShieldCheck, Settings, X, Sparkles } from 'lucide-react';
import {
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications/notification-engine';
import { ClubLogo } from '@/components/clubs/club-logo';
import type { TransferNotification } from '@/types/notification';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<TransferNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(getStoredNotifications());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleMarkAsRead = (id: string) => {
    const updated = markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = markAllNotificationsAsRead();
    setNotifications(updated);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Unread Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
        title="Notifications"
        aria-label="Transfer Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-extrabold text-slate-950 shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl z-50 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h3 className="font-display text-sm font-bold text-white">Transfer Updates</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Read all</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {notifications.length > 0 ? (
              notifications.map((item) => {
                const isRead = Boolean(item.readAt);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleMarkAsRead(item.id)}
                    className={`group relative rounded-xl border p-3 transition-colors cursor-pointer ${
                      isRead
                        ? 'border-slate-800/60 bg-slate-900/40 text-slate-400'
                        : 'border-emerald-500/30 bg-slate-900 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {item.clubId ? (
                        <ClubLogo clubId={item.clubId} size="xs" />
                      ) : (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-cyan-400">
                          <ShieldCheck className="h-3 w-3" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              item.eventType === 'OFFICIAL'
                                ? 'text-emerald-400'
                                : item.eventType === 'AGREEMENT_REACHED'
                                ? 'text-cyan-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {item.eventType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="mt-1 font-bold text-xs text-white leading-tight">{item.title}</h4>
                        <p className="mt-0.5 text-[11px] text-slate-300 line-clamp-2">{item.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1.5">
                <Bell className="mx-auto h-6 w-6 text-slate-600" />
                <p className="font-semibold text-slate-300">No transfer notifications yet.</p>
                <p className="text-[11px] text-slate-500">Follow a club or league to receive verified updates.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-xs">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:underline"
            >
              <span>View all notifications</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="/more/settings/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
