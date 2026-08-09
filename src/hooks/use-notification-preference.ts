'use client';

import { useEffect, useState, useMemo } from 'react';
import type { NotificationPreference, NotificationEventType } from '@/types/notification';

const STORAGE_KEY = 'transfer-tracker-notification-settings';

export const DEFAULT_NOTIFICATION_PREFERENCE: NotificationPreference = {
  enabled: true,
  eventTypes: [
    'OFFICIAL',
    'AGREEMENT_REACHED',
    'ADVANCED_TALKS',
    'BID_SUBMITTED',
    'FOLLOWED_CLUB_UPDATE',
    'FOLLOWED_LEAGUE_UPDATE',
    'CORRECTION',
    'CONTRADICTION',
  ],
  clubIds: [],
  leagueIds: [],
  minimumReliability: 80,
  inAppEnabled: true,
  pushEnabled: false,
};

export function useNotificationPreference() {
  const [preferences, setPreferences] = useState<NotificationPreference>(DEFAULT_NOTIFICATION_PREFERENCE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences({
          ...DEFAULT_NOTIFICATION_PREFERENCE,
          ...JSON.parse(stored),
        });
      }
    } catch {
      // Use defaults if localStorage is unavailable
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // ignore write errors
    }
  }, [preferences, hydrated]);

  const updatePreference = (updates: Partial<NotificationPreference>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const toggleEventType = (eventType: NotificationEventType) => {
    setPreferences((prev) => {
      const exists = prev.eventTypes.includes(eventType);
      return {
        ...prev,
        eventTypes: exists
          ? prev.eventTypes.filter((t) => t !== eventType)
          : [...prev.eventTypes, eventType],
      };
    });
  };

  return useMemo(
    () => ({
      preferences,
      hydrated,
      updatePreference,
      toggleEventType,
      setPreferences,
    }),
    [preferences, hydrated]
  );
}
