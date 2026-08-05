'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FeedMode, UserFeedSettings } from '@/types/news';

const PREFERENCE_KEY = 'transfer-tracker-feed-preference';

export function useFeedPreference() {
  const [settings, setSettings] = useState<UserFeedSettings>({
    defaultMode: 'global',
    defaultClubId: null,
    followedClubIds: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PREFERENCE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          defaultMode: parsed.defaultMode || (parsed.mode === 'global' ? 'global' : 'club'),
          defaultClubId: parsed.defaultClubId || (parsed.clubIds && parsed.clubIds[0]) || null,
          followedClubIds: Array.isArray(parsed.followedClubIds)
            ? parsed.followedClubIds
            : Array.isArray(parsed.clubIds)
            ? parsed.clubIds
            : [],
        });
      }
    } catch {
      // Default to global mode if unavailable
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PREFERENCE_KEY, JSON.stringify(settings));
    } catch {
      // ignore write errors
    }
  }, [settings, hydrated]);

  const setGlobalMode = () => {
    setSettings((prev) => ({
      ...prev,
      defaultMode: 'global',
      defaultClubId: null,
    }));
  };

  const setClubMode = (clubId: string) => {
    setSettings((prev) => ({
      ...prev,
      defaultMode: 'club',
      defaultClubId: clubId,
      followedClubIds: prev.followedClubIds.includes(clubId)
        ? prev.followedClubIds
        : [...prev.followedClubIds, clubId],
    }));
  };

  const setFollowedClubs = (clubIds: string[]) => {
    setSettings((prev) => ({
      ...prev,
      followedClubIds: clubIds,
    }));
  };

  return useMemo(
    () => ({
      settings,
      hydrated,
      setGlobalMode,
      setClubMode,
      setFollowedClubs,
      setSettings,
    }),
    [settings, hydrated]
  );
}
