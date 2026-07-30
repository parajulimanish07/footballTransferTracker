import { clubs } from '@/config/clubs';

export function matchClubs(text: string) {
  const value = text.toLowerCase();
  return clubs.filter((club) => {
    const matchCount = club.aliases.filter((alias) => value.includes(alias.toLowerCase())).length;
    if (club.id === 'inter') {
      return matchCount > 0 && /inter\s+milan|internazionale|serie a|milan/i.test(text);
    }
    return matchCount > 0;
  });
}

export function findClubBySlugOrId(value: string) {
  const normalised = value.toLowerCase();
  return clubs.find((club) => club.slug === normalised || club.id === normalised) ?? null;
}