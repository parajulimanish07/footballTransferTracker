import type { MetadataRoute } from 'next';
import { clubs } from '@/config/clubs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return [
    { url: `${baseUrl}/dashboard`, lastModified: new Date() },
    { url: `${baseUrl}/onboarding`, lastModified: new Date() },
    ...clubs.map((club) => ({ url: `${baseUrl}/club/${club.slug}`, lastModified: new Date() })),
  ];
}