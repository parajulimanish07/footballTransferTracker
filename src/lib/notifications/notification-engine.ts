import type { TransferNewsItem } from '@/types/news';
import type { TransferNotification, NotificationPreference, NotificationEventType } from '@/types/notification';
import { DEFAULT_NOTIFICATION_PREFERENCE } from '@/hooks/use-notification-preference';

const NOTIFICATIONS_STORAGE_KEY = 'transfer-tracker-user-notifications';
const PROCESSED_KEYS_KEY = 'transfer-tracker-processed-notification-keys';

const inMemoryNotifications: TransferNotification[] = [];
const processedKeysSet = new Set<string>();

export function resetNotificationState() {
  inMemoryNotifications.length = 0;
  processedKeysSet.clear();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      localStorage.removeItem(PROCESSED_KEYS_KEY);
    } catch {
      // ignore
    }
  }
}

export function generateNotificationKey(
  storyGroupId: string | null,
  articleId: string,
  eventType: NotificationEventType,
  statusVersion: string
): string {
  const primaryId = storyGroupId || articleId;
  return `${primaryId}:${eventType}:${statusVersion}`;
}

export function shouldNotifyItem(
  item: TransferNewsItem,
  preferences: NotificationPreference
): { shouldNotify: boolean; eventType: NotificationEventType | null; title: string; message: string } {
  if (!preferences.enabled || !preferences.inAppEnabled) {
    return { shouldNotify: false, eventType: null, title: '', message: '' };
  }

  const reliabilityScore = item.reliability === 'official' ? 100 : item.reliability === 'tier_1' ? 85 : 70;

  // Check minimum reliability threshold (except for verified official announcements)
  if (item.transferStatus !== 'official' && reliabilityScore < preferences.minimumReliability) {
    return { shouldNotify: false, eventType: null, title: '', message: '' };
  }

  // Check followed clubs/leagues matching
  const followedClubs = new Set(preferences.clubIds);
  const involvedClubIds = [
    item.currentClub?.id,
    item.destinationClub?.id,
    ...(item.relatedClubIds || []),
  ].filter(Boolean) as string[];

  const isFollowedClubUpdate = involvedClubIds.some((id) => followedClubs.has(id));

  let eventType: NotificationEventType | null = null;
  let title = '';
  let message = '';

  if (item.transferStatus === 'official' || item.evidenceLevel === 'official_confirmation') {
    if (preferences.eventTypes.includes('OFFICIAL')) {
      eventType = 'OFFICIAL';
      title = `Official Deal: ${item.playerName || 'Player Transfer'}`;
      message = `${item.destinationClub?.name || 'Club'} officially confirm signing of ${item.playerName || 'player'}.`;
    }
  } else if (item.transferStatus === 'agreement_reached') {
    if (reliabilityScore >= 85 && preferences.eventTypes.includes('AGREEMENT_REACHED')) {
      eventType = 'AGREEMENT_REACHED';
      title = `Agreement Reached: ${item.playerName || 'Transfer Target'}`;
      message = `Full agreement reported for ${item.playerName || 'player'} to join ${item.destinationClub?.name || 'destination club'}.`;
    }
  } else if (item.transferStatus === 'advanced_talks') {
    if (reliabilityScore >= 80 && preferences.eventTypes.includes('ADVANCED_TALKS')) {
      eventType = 'ADVANCED_TALKS';
      title = `Advanced Talks: ${item.playerName || 'Transfer Target'}`;
      message = `Advanced negotiations reported involving ${item.playerName || 'player'}.`;
    }
  } else if (item.transferStatus === 'bid_submitted') {
    if (reliabilityScore >= 80 && preferences.eventTypes.includes('BID_SUBMITTED')) {
      eventType = 'BID_SUBMITTED';
      title = `Bid Submitted: ${item.playerName || 'Transfer Target'}`;
      message = `Official proposal submitted for ${item.playerName || 'player'}.`;
    }
  } else if (isFollowedClubUpdate && preferences.eventTypes.includes('FOLLOWED_CLUB_UPDATE')) {
    eventType = 'FOLLOWED_CLUB_UPDATE';
    title = `Update for ${item.destinationClub?.name || item.currentClub?.name || 'Followed Club'}`;
    message = item.headline;
  }

  if (!eventType) {
    return { shouldNotify: false, eventType: null, title: '', message: '' };
  }

  return { shouldNotify: true, eventType, title, message };
}

export function processItemsForNotifications(
  items: TransferNewsItem[],
  preferences: NotificationPreference = DEFAULT_NOTIFICATION_PREFERENCE
): TransferNotification[] {
  const existingNotifications = getStoredNotifications();
  const existingKeys = getStoredProcessedKeys();

  const newNotifications: TransferNotification[] = [];

  for (const item of items) {
    const { shouldNotify, eventType, title, message } = shouldNotifyItem(item, preferences);
    if (!shouldNotify || !eventType) continue;

    const dedupeKey = generateNotificationKey(
      item.id, // using article id or story id
      item.id,
      eventType,
      item.transferStatus
    );

    if (existingKeys.has(dedupeKey) || processedKeysSet.has(dedupeKey)) {
      continue; // Skip duplicate notification for the same story update
    }

    const notification: TransferNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventType,
      title,
      message,
      articleId: item.id,
      storyGroupId: item.id,
      playerName: item.playerName,
      clubId: item.destinationClub?.id || item.currentClub?.id || null,
      leagueId: item.destinationClub?.league || item.currentClub?.league || null,
      reliabilityScore: item.reliability === 'official' ? 100 : item.reliability === 'tier_1' ? 85 : 70,
      createdAt: item.publishedAt || new Date().toISOString(),
      readAt: null,
    };

    newNotifications.push(notification);
    existingKeys.add(dedupeKey);
    processedKeysSet.add(dedupeKey);
  }

  if (newNotifications.length > 0) {
    const updated = [...newNotifications, ...existingNotifications].slice(0, 50);
    saveNotifications(updated, existingKeys);
    return updated;
  }

  return existingNotifications;
}

export function getStoredNotifications(): TransferNotification[] {
  if (typeof window === 'undefined') return inMemoryNotifications;
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : inMemoryNotifications;
  } catch {
    return inMemoryNotifications;
  }
}

export function getStoredProcessedKeys(): Set<string> {
  if (typeof window === 'undefined') return processedKeysSet;
  try {
    const stored = localStorage.getItem(PROCESSED_KEYS_KEY);
    return stored ? new Set(JSON.parse(stored)) : processedKeysSet;
  } catch {
    return processedKeysSet;
  }
}

export function saveNotifications(notifications: TransferNotification[], keys: Set<string>) {
  inMemoryNotifications.length = 0;
  inMemoryNotifications.push(...notifications);

  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    localStorage.setItem(PROCESSED_KEYS_KEY, JSON.stringify(Array.from(keys)));
  } catch {
    // ignore write errors
  }
}

export function markNotificationAsRead(id: string): TransferNotification[] {
  const current = getStoredNotifications();
  const keys = getStoredProcessedKeys();
  const updated = current.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  saveNotifications(updated, keys);
  return updated;
}

export function markAllNotificationsAsRead(): TransferNotification[] {
  const current = getStoredNotifications();
  const keys = getStoredProcessedKeys();
  const now = new Date().toISOString();
  const updated = current.map((n) => ({ ...n, readAt: n.readAt || now }));
  saveNotifications(updated, keys);
  return updated;
}
