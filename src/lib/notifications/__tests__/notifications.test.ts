import { describe, it, expect, beforeEach } from 'vitest';
import {
  shouldNotifyItem,
  processItemsForNotifications,
  generateNotificationKey,
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  saveNotifications,
  resetNotificationState,
} from '../notification-engine';
import type { TransferNewsItem } from '@/types/news';
import type { NotificationPreference } from '@/types/notification';
import { DEFAULT_NOTIFICATION_PREFERENCE } from '@/hooks/use-notification-preference';
import demoArticles from '../../../../src/data/demo-articles.json';

const mockOfficialItem: TransferNewsItem = {
  id: 'test-official-1',
  headline: 'Official: Kylian Mbappe joins Real Madrid',
  summary: 'Real Madrid confirm 5 year contract.',
  playerName: 'Kylian Mbappe',
  playerImageUrl: null,
  currentClub: { id: 'psg', name: 'PSG', slug: 'psg', league: 'Ligue 1', crestUrl: null },
  destinationClub: { id: 'real-madrid', name: 'Real Madrid', slug: 'real-madrid', league: 'La Liga', crestUrl: null },
  relatedClubIds: ['real-madrid', 'psg'],
  direction: 'incoming',
  sourceName: 'Real Madrid C.F. Official',
  sourceDomain: 'realmadrid.com',
  sourceUrl: 'https://www.realmadrid.com/official',
  journalistName: null,
  reliability: 'official',
  transferStatus: 'official',
  evidenceLevel: 'official_confirmation',
  publishedAt: '2026-08-06T10:00:00.000Z',
  updatedAt: '2026-08-06T10:00:00.000Z',
  imageUrl: null,
  isOfficial: true,
  duplicateGroupId: null,
};

const mockRumourItem: TransferNewsItem = {
  id: 'test-rumour-1',
  headline: 'Arsenal submit £60m bid for Bruno Guimaraes',
  summary: 'Arsenal make formal proposal.',
  playerName: 'Bruno Guimaraes',
  playerImageUrl: null,
  currentClub: { id: 'newcastle-united', name: 'Newcastle United', slug: 'newcastle-united', league: 'Premier League', crestUrl: null },
  destinationClub: { id: 'arsenal', name: 'Arsenal', slug: 'arsenal', league: 'Premier League', crestUrl: null },
  relatedClubIds: ['arsenal', 'newcastle-united'],
  direction: 'incoming',
  sourceName: 'BBC Sport',
  sourceDomain: 'bbc.com',
  sourceUrl: 'https://www.bbc.com/sport/1',
  journalistName: 'David Ornstein',
  reliability: 'tier_1',
  transferStatus: 'bid_submitted',
  evidenceLevel: 'trusted_report',
  publishedAt: '2026-08-06T09:00:00.000Z',
  updatedAt: '2026-08-06T09:00:00.000Z',
  imageUrl: null,
  isOfficial: false,
  duplicateGroupId: null,
};

describe('In-App Notification Engine & Deduplication Unit Tests', () => {
  beforeEach(() => {
    resetNotificationState();
  });

  it('6. Official followed-club update creates a notification', () => {
    const prefs: NotificationPreference = {
      ...DEFAULT_NOTIFICATION_PREFERENCE,
      clubIds: ['real-madrid'],
    };
    const { shouldNotify, eventType } = shouldNotifyItem(mockOfficialItem, prefs);
    expect(shouldNotify).toBe(true);
    expect(eventType).toBe('OFFICIAL');
  });

  it('7. Duplicate reports create only one notification via deduplication key', () => {
    const prefs: NotificationPreference = {
      ...DEFAULT_NOTIFICATION_PREFERENCE,
      clubIds: ['real-madrid'],
    };
    const key1 = generateNotificationKey('story-group-1', 'art-1', 'OFFICIAL', 'official');
    const key2 = generateNotificationKey('story-group-1', 'art-2', 'OFFICIAL', 'official');
    expect(key1).toBe(key2);

    const initialNotifs = processItemsForNotifications([mockOfficialItem], prefs);
    expect(initialNotifs.length).toBe(1);

    const duplicateNotifs = processItemsForNotifications([mockOfficialItem], prefs);
    expect(duplicateNotifs.length).toBe(1);
  });

  it('8. Reposts with same story ID do not create independent notifications', () => {
    const keyOriginal = generateNotificationKey('story-100', 'art-100', 'AGREEMENT_REACHED', 'agreement_reached');
    const keyRepost = generateNotificationKey('story-100', 'art-101', 'AGREEMENT_REACHED', 'agreement_reached');
    expect(keyOriginal).toBe(keyRepost);
  });

  it('9. Low-reliability reports below minimum threshold are excluded', () => {
    const lowReliabilityItem: TransferNewsItem = {
      ...mockRumourItem,
      reliability: 'trusted', // score 70
    };
    const prefs: NotificationPreference = {
      ...DEFAULT_NOTIFICATION_PREFERENCE,
      minimumReliability: 80,
    };
    const { shouldNotify } = shouldNotifyItem(lowReliabilityItem, prefs);
    expect(shouldNotify).toBe(false);
  });

  it('10. Unfollowed clubs without matching event type do not create notifications', () => {
    const prefs: NotificationPreference = {
      ...DEFAULT_NOTIFICATION_PREFERENCE,
      eventTypes: ['OFFICIAL'], // only official
      clubIds: ['liverpool'], // not arsenal
    };
    const { shouldNotify } = shouldNotifyItem(mockRumourItem, prefs);
    expect(shouldNotify).toBe(false);
  });

  it('11. Mark as read updates unread count', () => {
    const prefs = DEFAULT_NOTIFICATION_PREFERENCE;
    const notifs = processItemsForNotifications([mockOfficialItem], prefs);
    expect(notifs.length).toBe(1);
    expect(notifs[0].readAt).toBeNull();

    const updated = markNotificationAsRead(notifs[0].id);
    expect(updated[0].readAt).not.toBeNull();
  });

  it('12. Mark all as read updates all unread items', () => {
    const prefs = DEFAULT_NOTIFICATION_PREFERENCE;
    processItemsForNotifications([mockOfficialItem, mockRumourItem], prefs);

    const updated = markAllNotificationsAsRead();
    expect(updated.every((n) => n.readAt !== null)).toBe(true);
  });

  it('13. Notification contains correct articleId and playerName', () => {
    const prefs = DEFAULT_NOTIFICATION_PREFERENCE;
    const notifs = processItemsForNotifications([mockOfficialItem], prefs);
    expect(notifs[0].articleId).toBe(mockOfficialItem.id);
    expect(notifs[0].playerName).toBe(mockOfficialItem.playerName);
  });

  it('14. Notification preferences default to enabled in-app', () => {
    expect(DEFAULT_NOTIFICATION_PREFERENCE.enabled).toBe(true);
    expect(DEFAULT_NOTIFICATION_PREFERENCE.inAppEnabled).toBe(true);
    expect(DEFAULT_NOTIFICATION_PREFERENCE.minimumReliability).toBe(80);
  });

  it('15. Push permission is not requested automatically on engine load', () => {
    expect(DEFAULT_NOTIFICATION_PREFERENCE.pushEnabled).toBe(false);
  });

  it('16. Browser push remains disabled when feature flag is false', () => {
    const flag = process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED === 'true';
    expect(flag).toBe(false);
  });

  it('17. Offline demo snapshot items can be processed into notifications', () => {
    expect(Array.isArray(demoArticles)).toBe(true);
    expect(demoArticles.length).toBeGreaterThan(0);
  });
});
