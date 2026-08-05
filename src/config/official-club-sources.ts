export interface OfficialClubSource {
  clubId: string;
  clubName: string;
  officialDomain: string;
  officialSocialAccountIds: string[];
  rssUrl: string | null;
  officialApiUrl: string | null;
  ingestionMethod: 'rss' | 'api' | 'social' | 'manual';
  enabled: boolean;
}

export const officialClubSources: OfficialClubSource[] = [
  {
    clubId: 'liverpool',
    clubName: 'Liverpool',
    officialDomain: 'liverpoolfc.com',
    officialSocialAccountIds: ['LFC'],
    rssUrl: 'https://www.liverpoolfc.com/news/rss',
    officialApiUrl: null,
    ingestionMethod: 'rss',
    enabled: true,
  },
  {
    clubId: 'real-madrid',
    clubName: 'Real Madrid',
    officialDomain: 'realmadrid.com',
    officialSocialAccountIds: ['realmadrid'],
    rssUrl: 'https://www.realmadrid.com/en-US/rss/news',
    officialApiUrl: null,
    ingestionMethod: 'rss',
    enabled: true,
  },
  {
    clubId: 'arsenal',
    clubName: 'Arsenal',
    officialDomain: 'arsenal.com',
    officialSocialAccountIds: ['Arsenal'],
    rssUrl: 'https://www.arsenal.com/rss/news.xml',
    officialApiUrl: null,
    ingestionMethod: 'rss',
    enabled: true,
  },
  {
    clubId: 'manchester-city',
    clubName: 'Manchester City',
    officialDomain: 'mancity.com',
    officialSocialAccountIds: ['ManCity'],
    rssUrl: 'https://www.mancity.com/rss/news',
    officialApiUrl: null,
    ingestionMethod: 'rss',
    enabled: true,
  },
];

export function isOfficialClubDomain(domain: string): boolean {
  const d = domain.toLowerCase().replace(/^www\./, '');
  return officialClubSources.some((c) => d === c.officialDomain || d.endsWith(`.${c.officialDomain}`));
}
