export type NotificationEventType =
  | 'OFFICIAL'
  | 'AGREEMENT_REACHED'
  | 'ADVANCED_TALKS'
  | 'BID_SUBMITTED'
  | 'FOLLOWED_CLUB_UPDATE'
  | 'FOLLOWED_LEAGUE_UPDATE'
  | 'CORRECTION'
  | 'CONTRADICTION';

export interface NotificationPreference {
  enabled: boolean;
  eventTypes: NotificationEventType[];
  clubIds: string[];
  leagueIds: string[];
  minimumReliability: number;
  inAppEnabled: boolean;
  pushEnabled: boolean;
}

export interface TransferNotification {
  id: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  articleId: string | null;
  storyGroupId: string | null;
  playerName: string | null;
  clubId: string | null;
  leagueId: string | null;
  reliabilityScore: number;
  createdAt: string;
  readAt: string | null;
}
