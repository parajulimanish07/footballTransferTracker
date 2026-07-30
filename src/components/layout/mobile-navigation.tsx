'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Shield, Bookmark } from 'lucide-react';

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-bg/95 px-4 py-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-colors ${
            pathname === '/dashboard' ? 'text-accent-emerald' : 'text-muted hover:text-text'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Feed</span>
        </Link>
        <Link
          href="/onboarding"
          className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-colors ${
            pathname === '/onboarding' ? 'text-accent-emerald' : 'text-muted hover:text-text'
          }`}
        >
          <Shield className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Clubs</span>
        </Link>
        <Link
          href="/favorites"
          className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 transition-colors ${
            pathname === '/favorites' ? 'text-accent-emerald' : 'text-muted hover:text-text'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Saved</span>
        </Link>
      </div>
    </nav>
  );
}