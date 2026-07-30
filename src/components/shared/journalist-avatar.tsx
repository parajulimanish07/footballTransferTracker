import { UserCircle2 } from 'lucide-react';

export function JournalistAvatar({ name }: { name: string | null }) {
  if (!name) return <UserCircle2 className="h-5 w-5 text-muted" aria-hidden="true" />;
  return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-[11px] font-semibold text-text">{name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>;
}