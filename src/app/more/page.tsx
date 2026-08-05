import Link from 'next/link';
import { ArrowLeft, Bot, BookOpen, BarChart3, SlidersHorizontal, FilePlus, Radio, Tag, AlertTriangle, ShieldCheck, ChevronRight, Share2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';

export default function MoreMenuPage() {
  const secondaryLinks = [
    { href: '/assistant', label: 'AI Transfer Assistant', subtitle: 'Grounded RAG Q&A Assistant', icon: Bot, color: 'text-cyan-400' },
    { href: '/sources', label: 'Source Reliability', subtitle: 'Tier 1 verified publishers index', icon: BookOpen, color: 'text-emerald-400' },
    { href: '/analytics', label: 'AI Analytics', subtitle: 'Classification telemetry & metrics', icon: BarChart3, color: 'text-amber-400' },
  ];

  const adminLinks = [
    { href: '/admin/import-social', label: 'Import Social Post', subtitle: 'Submit X API / journalist update', icon: Share2 },
    { href: '/admin/import', label: 'Import Article', subtitle: 'Submit verified news URL', icon: FilePlus },
    { href: '/admin/providers', label: 'Provider Monitoring', subtitle: 'Live ingestion feed health', icon: Radio },
    { href: '/admin/labelling', label: 'Data Labelling', subtitle: 'Human-in-the-loop workbench', icon: Tag },
    { href: '/admin/review', label: 'Review Queue', subtitle: 'Flagged ML confidence audit', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            More Tools &amp; Features
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Access secondary intelligence tools, analytics, source metrics, and admin features.
          </p>
        </section>

        {/* Secondary Features Group */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Secondary Intelligence Tools</h2>
          <div className="space-y-2">
            {secondaryLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                      <Icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div>
                      <span className="block font-bold text-sm text-white">{item.label}</span>
                      <span className="block text-xs text-slate-400">{item.subtitle}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Studio Group */}
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Admin Studio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                      <Icon className="h-4 w-4 text-slate-300" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-white">{item.label}</span>
                      <span className="block text-[11px] text-slate-400">{item.subtitle}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
