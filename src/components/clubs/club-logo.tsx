'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getClubById, FALLBACK_CLUB_LOGO } from '@/config/clubs';

export interface ClubLogoProps {
  clubId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showName?: boolean;
  priority?: boolean;
  className?: string;
  fallbackSrc?: string;
}

const SIZE_MAP = {
  xs: { dim: 20, class: 'h-5 w-5' },
  sm: { dim: 28, class: 'h-7 w-7' },
  md: { dim: 40, class: 'h-10 w-10' },
  lg: { dim: 56, class: 'h-14 w-14' },
};

export function ClubLogo({
  clubId,
  size = 'md',
  showName = false,
  priority = false,
  className = '',
  fallbackSrc = FALLBACK_CLUB_LOGO.src,
}: ClubLogoProps) {
  const club = getClubById(clubId);
  const logo = club?.logo || FALLBACK_CLUB_LOGO;
  const [imageSrc, setImageSrc] = useState<string>(logo.src);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  const handleImageError = () => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-slate-900 border border-slate-800/80 flex items-center justify-center p-0.5 ${sizeConfig.class}`}>
        <Image
          key={`${clubId}-${imageSrc}`}
          src={imageSrc}
          alt={logo.alt || `${club?.name || 'Club'} crest logo`}
          width={sizeConfig.dim}
          height={sizeConfig.dim}
          priority={priority}
          unoptimized
          onError={handleImageError}
          className="object-contain w-full h-full"
        />
      </div>
      {showName && club && (
        <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
          {club.name}
        </span>
      )}
    </div>
  );
}
