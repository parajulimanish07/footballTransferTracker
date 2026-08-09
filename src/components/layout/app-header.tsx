'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationCenter } from '@/components/notifications/notification-center';
import {
  ArrowRightLeft,
  Globe,
  Trophy,
  Heart,
  MoreHorizontal,
  Bot,
  BookOpen,
  BarChart3,
  SlidersHorizontal,
  FilePlus,
  Radio,
  Tag,
  AlertTriangle,
} from 'lucide-react';

export function AppHeader() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const secondaryLinks = [
    { href: '/assistant', label: 'AI Transfer Assistant', icon: Bot, color: 'text-cyan-400' },
    { href: '/sources', label: 'Source Reliability', icon: BookOpen, color: 'text-emerald-400' },
    { href: '/analytics', label: 'AI Analytics', icon: BarChart3, color: 'text-amber-400' },
  ];

  const adminLinks = [
    { href: '/admin/import', label: 'Import Article', icon: FilePlus },
    { href: '/admin/providers', label: 'Provider Monitoring', icon: Radio },
    { href: '/admin/labelling', label: 'Data Labelling', icon: Tag },
    { href: '/admin/review', label: 'Review Queue', icon: AlertTriangle },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand & Main Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-text" title="Transfer Tracker Home">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <ArrowRightLeft className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-extrabold tracking-tight text-text">
              TRANSFER<span className="text-emerald-400">TRACKER</span>
            </span>
          </Link>

          {/* 4 Top-Level Main Nav Items */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                pathname === '/dashboard' || pathname === '/'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-text hover:bg-slate-900'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>

            <Link
              href="/leagues"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                pathname.startsWith('/leagues') || pathname.startsWith('/league')
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-text hover:bg-slate-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Leagues</span>
            </Link>

            <Link
              href="/following"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                pathname === '/following'
                  ? 'bg-slate-800 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-text hover:bg-slate-900'
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>Following</span>
            </Link>

            {/* More Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  pathname === '/more' || pathname.startsWith('/admin') || pathname === '/assistant' || pathname === '/sources' || pathname === '/analytics'
                    ? 'bg-slate-800 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-text hover:bg-slate-900'
                }`}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                <span>More</span>
              </button>

              {moreOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-xl z-50">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 mb-1">
                    Secondary Features
                  </div>
                  {secondaryLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 mb-1">
                    Admin Studio
                  </div>
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Actions & Status Badge */}
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Verified Feed</span>
          </div>
        </div>
      </div>
    </header>
  );
}