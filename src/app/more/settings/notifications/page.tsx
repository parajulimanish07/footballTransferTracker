'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, ShieldCheck, Sliders, Volume2, Smartphone } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { useNotificationPreference } from '@/hooks/use-notification-preference';
import type { NotificationEventType } from '@/types/notification';

export default function NotificationSettingsPage() {
  const { preferences, updatePreference, toggleEventType } = useNotificationPreference();
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const PUSH_ENABLED_FLAG = process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true';

  const handleRequestPush = async () => {
    if (!PUSH_ENABLED_FLAG) {
      setPushStatus('Browser push notifications are currently disabled in feature flags.');
      return;
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await window.Notification.requestPermission();
      if (permission === 'granted') {
        updatePreference({ pushEnabled: true });
        setPushStatus('Push notifications enabled successfully.');
      } else {
        updatePreference({ pushEnabled: false });
        setPushStatus('Push notification permission denied by browser.');
      }
    } else {
      setPushStatus('Browser push notifications not supported by this browser.');
    }
  };

  const EVENT_TYPE_LABELS: Record<NotificationEventType, { label: string; desc: string }> = {
    OFFICIAL: { label: 'Official Confirmations', desc: 'Alerts when official club announcements confirm a deal' },
    AGREEMENT_REACHED: { label: 'Agreement Reached', desc: 'Alerts when full personal terms or fee agreement is reported' },
    ADVANCED_TALKS: { label: 'Advanced Talks', desc: 'Alerts when advanced negotiations are reported' },
    BID_SUBMITTED: { label: 'Bid Submitted', desc: 'Alerts when formal proposals are submitted' },
    FOLLOWED_CLUB_UPDATE: { label: 'Followed Club Updates', desc: 'Alerts for any verified news involving followed teams' },
    FOLLOWED_LEAGUE_UPDATE: { label: 'Followed League Updates', desc: 'Alerts for verified news in followed competitions' },
    CORRECTION: { label: 'Corrections & Collapses', desc: 'Alerts when previously reported deals collapse or change' },
    CONTRADICTION: { label: 'Contradicting Reports', desc: 'Alerts when conflicting reports emerge on major targets' },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/more" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to More Tools
          </Link>
        </div>

        {/* Page Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <Bell className="h-4 w-4" />
            <span>Notification Preferences</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Notification Settings
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
            Customize which verified transfer events trigger in-app alerts and browser notifications.
          </p>
        </section>

        {/* Master In-App Toggle */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">In-App Notifications</h3>
                <p className="text-xs text-slate-400">Show notification bell counter & activity updates</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => updatePreference({ inAppEnabled: !preferences.inAppEnabled })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                preferences.inAppEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.inAppEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Event Types Group */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Event Categories</h3>

          <div className="space-y-3">
            {(Object.keys(EVENT_TYPE_LABELS) as NotificationEventType[]).map((key) => {
              const info = EVENT_TYPE_LABELS[key];
              const isChecked = preferences.eventTypes.includes(key);
              return (
                <label key={key} className="flex items-start justify-between cursor-pointer group">
                  <div className="pr-4">
                    <span className="block font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {info.label}
                    </span>
                    <span className="block text-[11px] text-slate-400">{info.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleEventType(key)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Minimum Reliability Slider */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>Minimum Source Reliability Threshold</span>
            </div>
            <span className="font-mono text-xs font-extrabold text-emerald-400">{preferences.minimumReliability}%</span>
          </div>

          <input
            type="range"
            min={60}
            max={100}
            step={5}
            value={preferences.minimumReliability}
            onChange={(e) => updatePreference({ minimumReliability: Number(e.target.value) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <p className="text-[11px] text-slate-400">
            Only notify when source reliability score meets or exceeds {preferences.minimumReliability}%.
          </p>
        </div>

        {/* Optional Browser Push Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Browser Push Notifications</h3>
                <p className="text-xs text-slate-400">Optional desktop / mobile push alerts</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestPush}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              {preferences.pushEnabled ? 'Enabled' : 'Enable Push'}
            </button>
          </div>

          {pushStatus && <p className="text-[11px] font-medium text-amber-400 pt-1">{pushStatus}</p>}
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
