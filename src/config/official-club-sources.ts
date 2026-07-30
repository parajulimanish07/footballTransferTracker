export interface OfficialClubSource {
  clubId: string;
  clubName: string;
  officialDomain: string;
  feedUrl?: string;
  newsPageUrl?: string;
  ingestionMethod: 'rss' | 'api' | 'manual';
  enabled: boolean;
}

export const officialClubSources: OfficialClubSource[] = [
  {
    clubId: 'liverpool',
    clubName: 'Liverpool FC',
    officialDomain: 'liverpoolfc.com',
    feedUrl: 'https://www.liverpoolfc.com/news.xml',
    newsPageUrl: 'https://www.liverpoolfc.com/news',
    ingestionMethod: 'rss',
    enabled: true,
  },
  {
    clubId: 'arsenal',
    clubName: 'Arsenal FC',
    officialDomain: 'arsenal.com',
    feedUrl: 'https://www.arsenal.com/rss/news.xml',
    newsPageUrl: 'https://www.arsenal.com/news',
    ingestionMethod: 'rss',
    enabled: true,
  },
  {
    clubId: 'real-madrid',
    clubName: 'Real Madrid CF',
    officialDomain: 'realmadrid.com',
    newsPageUrl: 'https://www.realmadrid.com/en-US/news',
    ingestionMethod: 'manual',
    enabled: true,
  },
  {
    clubId: 'barcelona',
    clubName: 'FC Barcelona',
    officialDomain: 'fcbarcelona.com',
    newsPageUrl: 'https://www.fcbarcelona.com/en/news',
    ingestionMethod: 'manual',
    enabled: true,
  },
  {
    clubId: 'manchester-united',
    clubName: 'Manchester United',
    officialDomain: 'manutd.com',
    newsPageUrl: 'https://www.manutd.com/en/news',
    ingestionMethod: 'manual',
    enabled: true,
  },
];

export function getOfficialClubSource(clubId: string): OfficialClubSource | undefined {
  return officialClubSources.find((s) => s.clubId === clubId && s.enabled);
}

export function isOfficialClubDomain(domain: string): boolean {
  const norm = domain.toLowerCase().replace(/^www\./, '');
  return officialClubSources.some((s) => s.enabled && s.officialDomain === norm);
}
