import Link from 'next/link';
import { ShieldCheck, Flame, Bookmark, ArrowRightLeft, BarChart3, Tag, AlertTriangle, BookOpen } from 'lucide-react';
import { ThemeFontSwitcher } from '@/components/theme/theme-font-switcher';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="group flex items-center gap-3 text-text">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-emerald/30 bg-accent-emerald/10 text-accent-emerald shadow-emeraldGlow transition-transform group-hover:scale-105">
              <ArrowRightLeft className="h-5 w-5" />
            </span>
            <div>
              <span className="block font-display text-base font-bold tracking-tight text-text">
                TRANSFER<span className="text-accent-emerald">TRACKER</span>
              </span>
              <span className="block text-[11px] font-medium tracking-wide text-muted">
                TRANSFER INTELLIGENCE
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text hover:bg-white/5 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/sources"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-accent-emerald" />
              Sources Directory
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <BarChart3 className="h-3.5 w-3.5 text-accent-cyan" />
              AI Analytics
            </Link>
            <Link
              href="/admin/import"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              Import Report
            </Link>
            <Link
              href="/admin/providers"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              Providers
            </Link>
            <Link
              href="/admin/labelling"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <Tag className="h-3.5 w-3.5 text-accent-amber" />
              Labelling
            </Link>
            <Link
              href="/admin/review"
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              Review Queue
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeFontSwitcher />

          <div className="hidden xl:flex items-center gap-2 rounded-full border border-accent-emerald/20 bg-accent-emerald/10 px-3 py-1 text-xs font-medium text-accent-emerald">
            <span className="h-2 w-2 rounded-full bg-accent-emerald animate-status-pulse" />
            <Flame className="h-3.5 w-3.5" />
            <span>Transfer Window Open</span>
          </div>

          <Link
            href="/sources"
            className="flex items-center gap-1.5 text-xs font-semibold text-accent-emerald rounded-lg border border-accent-emerald/30 bg-accent-emerald/10 px-2.5 py-1.5 hover:bg-accent-emerald hover:text-slate-950 transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tier-1 Verified</span>
          </Link>
        </div>
      </div>
    </header>
  );
}