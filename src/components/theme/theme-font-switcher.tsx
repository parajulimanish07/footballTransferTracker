'use client';

import { Moon } from 'lucide-react';

export function ThemeFontSwitcher() {
  return (
    <div
      title="Dark Mode Active"
      className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text shadow-sm"
    >
      <Moon className="h-4 w-4 text-accent-cyan" />
      <span className="hidden sm:inline">Dark Mode</span>
    </div>
  );
}
