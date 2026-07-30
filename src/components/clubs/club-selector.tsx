'use client';

import { Search, Check, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { clubs, popularClubIds } from '@/config/clubs';

export function ClubSelector({ value, onChange, multiple = true }: { value: string[]; onChange: (ids: string[]) => void; multiple?: boolean }) {
  const [query, setQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

  const leagues = useMemo(() => Array.from(new Set(clubs.map((c) => c.league))), []);

  const filtered = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = `${club.name} ${club.league} ${club.aliases.join(' ')}`.toLowerCase().includes(query.toLowerCase());
      const matchesLeague = !selectedLeague || club.league === selectedLeague;
      return matchesSearch && matchesLeague;
    });
  }, [query, selectedLeague]);

  function toggle(id: string) {
    if (multiple) {
      onChange(value.includes(id) ? value.filter((clubId) => clubId !== id) : [...value, id]);
      return;
    }
    onChange([id]);
  }

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search football clubs or leagues..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none focus:ring-1 focus:ring-accent-emerald transition-all"
        />
      </div>

      {/* Popular Clubs Quick Selectors */}
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block mb-2">
          Popular Clubs
        </span>
        <div className="flex flex-wrap gap-2">
          {popularClubIds.map((clubId) => {
            const club = clubs.find((item) => item.id === clubId)!;
            const isSelected = value.includes(club.id);
            return (
              <button
                key={club.id}
                type="button"
                onClick={() => toggle(club.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-accent-emerald text-slate-950 shadow-emeraldGlow'
                    : 'border border-white/10 bg-white/5 text-muted hover:text-text hover:bg-white/10'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                <span>{club.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* League Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => setSelectedLeague(null)}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            !selectedLeague ? 'bg-white/15 text-text' : 'text-muted hover:text-text hover:bg-white/5'
          }`}
        >
          All Leagues
        </button>
        {leagues.map((league) => (
          <button
            key={league}
            type="button"
            onClick={() => setSelectedLeague(selectedLeague === league ? null : league)}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              selectedLeague === league ? 'bg-white/15 text-text' : 'text-muted hover:text-text hover:bg-white/5'
            }`}
          >
            {league}
          </button>
        ))}
      </div>

      {/* Grid of Clubs */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {filtered.map((club) => {
          const isSelected = value.includes(club.id);
          return (
            <button
              key={club.id}
              type="button"
              onClick={() => toggle(club.id)}
              className={`flex items-center justify-between rounded-2xl border p-3.5 text-left text-xs transition-all ${
                isSelected
                  ? 'border-accent-emerald/40 bg-accent-emerald/10 text-text shadow-sm'
                  : 'border-white/8 bg-white/[0.03] text-text hover:bg-white/8 hover:border-white/15'
              }`}
            >
              <div>
                <span className="block font-bold text-sm text-text">{club.name}</span>
                <span className="block text-slate-400 mt-0.5">{club.league}</span>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                  isSelected
                    ? 'border-accent-emerald bg-accent-emerald text-slate-950'
                    : 'border-white/20 bg-white/5 text-transparent'
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}