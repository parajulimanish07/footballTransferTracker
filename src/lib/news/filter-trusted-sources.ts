import { normalisePersonName, trustedSources, journalists } from '@/config/trusted-sources';
import { clubs } from '@/config/clubs';

const officialLeagueDomains = new Set([
  'premierleague.com',
  'laliga.com',
  'legaseriea.it',
  'bundesliga.com',
  'ligue1.com',
]);

function getOfficialClubDomains() {
  return clubs
    .map((club) => club.websiteUrl)
    .filter((websiteUrl): websiteUrl is string => Boolean(websiteUrl))
    .map((websiteUrl) => new URL(websiteUrl).hostname.replace(/^www\./, '').toLowerCase());
}

export function isOfficialClubDomain(domain: string): boolean {
  const d = domain.toLowerCase().replace(/^www\./, '');
  return getOfficialClubDomains().some((official) => d === official || d.endsWith(`.${official}`));
}

export function isTrustedDomain(domain: string) {
  const normalisedDomain = domain.toLowerCase();
  if (
    trustedSources.some(
      (source) =>
        (source.active ?? source.enabled) &&
        source.domain &&
        (source.domain === normalisedDomain ||
          normalisedDomain.endsWith(`.${source.domain}`) ||
          (source.domain.includes('bbc') && (normalisedDomain.includes('bbc.com') || normalisedDomain.includes('bbc.co.uk'))))
    )
  ) {
    return true;
  }

  if (officialLeagueDomains.has(normalisedDomain)) {
    return true;
  }

  return isOfficialClubDomain(normalisedDomain);
}

export function isTrustedSource(domain: string, journalistName: string | null) {
  if (isTrustedDomain(domain)) {
    return true;
  }

  if (!journalistName) {
    return false;
  }

  const normalised = normalisePersonName(journalistName);
  return journalists.some((journalist) => journalist.enabled && journalist.normalisedNames.some((candidate) => normalisePersonName(candidate) === normalised));
}