'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'transfer-news.followed-clubs';
const DEFAULT_KEY = 'transfer-news.default-club';

export function useFollowedClubs() {
  const [followedClubs, setFollowedClubs] = useState<string[]>([]);
  const [defaultClub, setDefaultClub] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedFollowed = window.localStorage.getItem(STORAGE_KEY);
      const storedDefault = window.localStorage.getItem(DEFAULT_KEY);
      setFollowedClubs(storedFollowed ? JSON.parse(storedFollowed) : []);
      setDefaultClub(storedDefault);
    } catch {
      setFollowedClubs([]);
      setDefaultClub(null);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(followedClubs));
    if (defaultClub) {
      window.localStorage.setItem(DEFAULT_KEY, defaultClub);
    } else {
      window.localStorage.removeItem(DEFAULT_KEY);
    }
  }, [defaultClub, followedClubs, hydrated]);

  const api = useMemo(() => ({
    followedClubs,
    defaultClub,
    hydrated,
    setFollowedClubs,
    setDefaultClub,
  }), [defaultClub, followedClubs, hydrated]);

  return api;
}