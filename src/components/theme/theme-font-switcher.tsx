'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeFont } from './theme-font-provider';

export function ThemeFontSwitcher() {
  const { theme, toggleTheme } = useThemeFont();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text hover:bg-accent-emerald hover:text-slate-950 transition-all active:scale-95 shadow-sm"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4 text-accent-amber" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-accent-cyan" />
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
}
