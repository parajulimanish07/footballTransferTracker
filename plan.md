Build a production-ready football transfer news application from scratch using Next.js, TypeScript and the App Router.

The purpose of this application is to help football supporters follow transfer news about selected clubs without being overwhelmed by unreliable rumours, fake social-media posts, clickbait websites or duplicate reports.

The application must only display transfer news from a carefully controlled list of trusted sources and journalists.

## Core product idea

Users should be able to:

1. Select one or more football clubs they support.
2. See a personalised transfer-news feed for those clubs.
3. Filter reports by reliability and transfer status.
4. understand whether a transfer is:

   * Official
   * Confirmed by a highly trusted journalist
   * In advanced negotiations
   * An active approach or enquiry
   * General interest
5. Open the original source to read the complete report.
6. Save their selected clubs for future visits.
7. Avoid duplicate stories that report the same transfer development.

Build the complete user interface, application structure, sample data, source-verification system and API integration architecture.

## Technology

Use:

* Next.js with the latest stable App Router
* TypeScript
* Tailwind CSS
* shadcn/ui where appropriate
* Lucide React icons
* Zod for API-response validation
* date-fns for relative dates
* Local storage for the first version of user preferences
* Server Components by default
* Client Components only for interactive elements
* Next.js Route Handlers for external news API requests
* Environment variables for all API keys

Do not expose external API keys in the browser.

Do not add authentication or a database in the first implementation unless it is needed for the core experience.

Structure the application so that Supabase or PostgreSQL can be added later for accounts, saved articles, followed clubs and notification preferences.

## Design direction

Create a premium modern football-news interface.

The application should feel like a combination of:

* A professional sports newsroom
* A transfer command centre
* A personalised football dashboard

Use a dark-first visual design with:

* Deep charcoal or near-black background
* White and soft-grey typography
* Subtle glass panels
* Carefully used green, blue or amber status accents
* Large editorial headlines
* Club crests and competition badges
* Rounded cards
* Subtle borders
* Soft shadows
* Smooth but restrained animations
* Excellent mobile responsiveness

Avoid excessive gradients, neon effects, oversized decorative elements and gaming-style visuals.

The interface must look credible, professional and easy to scan.

## Main pages

### 1. Landing and onboarding page

Create an onboarding screen with:

* Application name and logo
* Headline such as “Transfer news without the noise”
* Supporting description explaining that reports come only from selected trusted sources
* Searchable club selector
* Popular-club suggestions
* Continue button
* Small explanation of how source verification works

Allow users to select multiple clubs.

Initially include major clubs from:

* Premier League
* La Liga
* Serie A
* Bundesliga
* Ligue 1

Store selected club IDs in local storage.

### 2. Personalised news dashboard

Create a dashboard containing:

* Top navigation
* Selected-club switcher
* Transfer-window status
* Last-updated time
* Refresh button
* Search input
* Reliability filter
* Transfer-status filter
* Sort control
* Main transfer-news feed
* Trending-player sidebar on desktop
* Mobile bottom navigation or compact mobile menu

The page heading should update according to the selected team, for example:

“Liverpool Transfer Centre”

or:

“Manchester United Transfer News”

### 3. Club transfer page

Use a dynamic route:

/club/[slug]

Display:

* Club crest
* Club name
* League
* Transfer-window summary
* Arrivals count
* Departures count
* Active targets count
* Latest reliable reports
* Confirmed transfers
* Players linked with the club
* Players expected to leave

Do not fabricate transfer statistics. When real data is unavailable, clearly label sample content as demonstration data.

### 4. Story detail page

Use a route such as:

/news/[id]

Display:

* Headline
* Player
* Clubs involved
* Transfer direction
* Reliability label
* Transfer-status label
* Source
* Journalist
* Published time
* Short original summary
* Timeline of related reports
* Link to the original article or post

Do not reproduce complete copyrighted articles.

Only display the headline, source information, a short factual summary and a link to the original report.

## Trusted-source system

Create a central configuration file such as:

src/config/trusted-sources.ts

Each source should have:

* id
* displayName
* type
* domain
* journalistNames
* reliabilityTier
* profileUrl
* supportedLeagues
* enabled

Start with a configurable allowlist containing examples such as:

Tier 1 journalists:

* David Ornstein
* Fabrizio Romano
* James Pearce for Liverpool-related reporting
* Paul Joyce for Liverpool and North-West football
* Simon Stone
* Laurie Whitwell for Manchester United
* Mario Cortegana for Real Madrid
* Matteo Moretto
* Florian Plettenberg for German football
* Ben Jacobs, but assign a lower reliability level than Ornstein or Romano

Trusted publishers and official sources:

* Official club websites
* Official league websites
* BBC Sport
* The Athletic
* Sky Sports
* The Guardian
* Reuters
* ESPN, where appropriate

This list must be easy to edit. Do not hard-code filtering logic throughout the components.

Important: inclusion on the source list does not mean that every report is a completed transfer. The application must distinguish reliable reporting from official confirmation.

## Reliability levels

Create the following reliability levels:

### Official

The information comes directly from:

* A football club
* A league
* A football association
* The player’s verified official announcement

### Tier 1

Reported by a journalist or publisher with a strong record for the relevant club, league or region.

### Trusted

Published by a recognised sports-news organisation but not necessarily by the most authoritative journalist for that club.

Do not display articles from sources outside these approved levels.

Do not create a “low reliability” or “rumour” feed in the initial version.

## Transfer-status labels

Use these statuses:

* OFFICIAL
* AGREEMENT_REACHED
* ADVANCED_TALKS
* NEGOTIATIONS
* BID_SUBMITTED
* APPROACH_MADE
* INTEREST
* DEPARTURE_EXPECTED

Display clear labels such as:

* Official
* Agreement reached
* Advanced talks
* Negotiations ongoing
* Bid submitted
* Approach made
* Interest reported
* Departure expected

Never automatically convert “interest” or “talks” into “confirmed”.

## Transfer-news data model

Create a strongly typed model similar to:

```ts
type ReliabilityLevel = "official" | "tier_1" | "trusted";

type TransferStatus =
  | "official"
  | "agreement_reached"
  | "advanced_talks"
  | "negotiations"
  | "bid_submitted"
  | "approach_made"
  | "interest"
  | "departure_expected";

interface TransferNewsItem {
  id: string;
  headline: string;
  summary: string;
  playerName: string | null;
  playerImageUrl: string | null;
  currentClub: ClubSummary | null;
  destinationClub: ClubSummary | null;
  relatedClubIds: string[];
  direction: "incoming" | "outgoing" | "related" | null;
  sourceName: string;
  sourceDomain: string;
  sourceUrl: string;
  journalistName: string | null;
  reliability: ReliabilityLevel;
  transferStatus: TransferStatus;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string | null;
  isOfficial: boolean;
  duplicateGroupId: string | null;
}
```

Also create types for:

* Club
* Journalist
* TrustedSource
* TransferReport
* Player
* NewsApiResponse
* FilterState

## Data-fetching architecture

Create a provider-based architecture.

Suggested structure:

```text
src/
  app/
    page.tsx
    onboarding/page.tsx
    dashboard/page.tsx
    club/[slug]/page.tsx
    news/[id]/page.tsx
    api/news/route.ts
    api/clubs/route.ts
  components/
    layout/
    clubs/
    news/
    filters/
    reliability/
    transfer/
    shared/
  config/
    clubs.ts
    trusted-sources.ts
  lib/
    news/
      providers/
        news-api-provider.ts
        gnews-provider.ts
        guardian-provider.ts
        mock-provider.ts
      normalise-news.ts
      filter-trusted-sources.ts
      classify-transfer-status.ts
      match-clubs.ts
      deduplicate-news.ts
      score-reliability.ts
    storage/
    utils/
  types/
    news.ts
    club.ts
    source.ts
```

Create a shared `NewsProvider` interface so providers can be replaced without rewriting the UI.

Example:

```ts
interface NewsProvider {
  getTransferNews(options: TransferNewsQuery): Promise<TransferNewsItem[]>;
}
```

Start the interface using a realistic mock provider so the complete application works without an API key.

Then implement optional adapters for:

* NewsAPI
* GNews
* The Guardian Open Platform

Select the active provider through an environment variable:

```env
NEWS_PROVIDER=mock
NEWS_API_KEY=
GNEWS_API_KEY=
GUARDIAN_API_KEY=
```

## Strict filtering pipeline

Every fetched result must pass through this pipeline:

1. Validate the API response with Zod.
2. Normalise the external result into the internal data model.
3. Extract the publisher domain and author.
4. Reject the result unless its domain or journalist matches the trusted-source allowlist.
5. Match the report to clubs using club names, aliases and common abbreviations.
6. Determine whether it concerns an incoming or outgoing transfer.
7. Assign a transfer-status label conservatively.
8. Calculate its reliability level.
9. Detect duplicates.
10. Sort by reliability first and publication time second.

Never show an article merely because it contains the words “transfer”, “signing” or a club name.

## Club matching

Each club should have aliases.

Example:

```ts
{
  id: "manchester-united",
  name: "Manchester United",
  slug: "manchester-united",
  aliases: [
    "Manchester United",
    "Man United",
    "Man Utd",
    "MUFC",
    "United"
  ]
}
```

Avoid relying on ambiguous aliases such as “United” alone unless other text confirms the club.

The matching system should inspect:

* Headline
* Description
* Article URL
* Source metadata
* Extracted entities

## Journalist matching

Author fields are not always consistent.

Normalise author names by:

* Converting to lowercase
* Removing publisher suffixes
* Removing punctuation
* Trimming spaces
* Matching known variations

Examples:

* “David Ornstein”
* “David Ornstein, The Athletic”
* “The Athletic - David Ornstein”

All should resolve to the same journalist record.

Do not assume the journalist based only on the publisher.

## Duplicate detection

Different publishers may repeat the same original report.

Create duplicate detection using:

* Normalised player name
* Clubs involved
* Similar headline words
* Transfer status
* Publication-time proximity
* Canonical source URL

When several stories describe the same update:

* Show the most authoritative original report first.
* Add a “Also reported by” section.
* Do not fill the feed with near-identical cards.

Do not use an external AI service for duplicate detection in the first version. Implement a deterministic similarity function.

## News-card design

Each card should show:

* Status label
* Reliability badge
* Headline
* Short two- or three-line summary
* Player name
* Clubs involved
* Incoming or outgoing indicator
* Journalist
* Publisher
* Relative publication time
* Original-source link
* Optional image

Example badges:

* Official
* Tier 1
* Trusted source
* Advanced talks
* Incoming
* Outgoing

Make the source and journalist highly visible so users immediately understand why the report is trusted.

## Filters

Include filters for:

* Club
* Incoming
* Outgoing
* Official
* Tier 1
* Trusted
* Transfer status
* Journalist
* Publisher
* Last 24 hours
* Last 7 days
* Latest
* Most reliable

Filters should update the URL query parameters so pages can be bookmarked and shared.

## Personalisation

Store the following in local storage:

* Followed clubs
* Default club
* Hidden stories
* Preferred reliability level
* Preferred transfer direction

Create a reusable hook:

```ts
useFollowedClubs()
```

Handle hydration correctly and avoid accessing local storage in Server Components.

## API endpoint

Create:

GET /api/news

Supported query parameters:

* club
* reliability
* status
* direction
* source
* journalist
* from
* to
* page
* limit

Return:

```ts
{
  data: TransferNewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta: {
    provider: string;
    lastUpdated: string;
    selectedClub: string | null;
  };
}
```

Add:

* Input validation
* Error handling
* Request timeout
* Caching
* Rate-limit awareness
* Safe error messages
* Loading states
* Empty states
* Retry states

## Transfer-status classification

Implement a conservative rule-based classifier.

Examples:

* “signs”, “completed”, “announces” from an official source → Official
* “agreement reached”, “deal agreed”, “here we go” from an approved journalist → Agreement reached
* “final stages”, “advanced talks” → Advanced talks
* “in talks”, “negotiating” → Negotiations
* “bid submitted”, “offer made” → Bid submitted
* “contacted”, “approached” → Approach made
* “interested”, “monitoring”, “considering” → Interest

The classifier must never claim greater certainty than the source text.

Add unit tests for these classification rules.

## Example UI content

Create realistic mock data covering:

* Official signing
* Agreement reached
* Advanced negotiations
* Bid rejected
* Club interest
* Expected departure
* Duplicate reports from multiple sources
* Incoming and outgoing stories

Clearly mark all mock stories as demonstration data.

Do not present fictional mock transfers as current real news.

## Components to build

Create reusable components including:

* AppHeader
* ClubSelector
* ClubSearchDialog
* FollowedClubTabs
* TransferNewsCard
* NewsFeed
* NewsCardSkeleton
* ReliabilityBadge
* TransferStatusBadge
* TransferDirectionBadge
* TransferFilters
* SourcePopover
* JournalistAvatar
* EmptyNewsState
* ErrorState
* TrendingPlayers
* TransferSummary
* MobileNavigation
* LastUpdatedIndicator

## Accessibility

Ensure:

* Semantic HTML
* Keyboard-accessible selectors
* Visible focus states
* ARIA labels where required
* Sufficient colour contrast
* Screen-reader-friendly badges
* Reduced-motion support
* Touch-friendly mobile controls
* No critical information communicated through colour alone

## Performance

Use:

* Server Components where possible
* Next.js Image for external images
* Skeleton loading
* Appropriate caching
* Lazy loading
* Minimal client-side JavaScript
* Pagination or infinite scrolling
* Optimised font loading

Configure allowed external image domains safely.

## SEO and metadata

Add:

* Page metadata
* Dynamic club-page titles
* Dynamic descriptions
* Open Graph tags
* Twitter card metadata
* Canonical URLs
* robots configuration
* sitemap structure

Example title:

“Liverpool Transfer News | Verified Transfer Reports”

## Legal and attribution requirements

Do not scrape protected pages without permission.

Do not reproduce complete articles.

Display:

* Headline
* Short factual summary
* Journalist
* Publisher
* Publication time
* Link to the original source

Always provide clear attribution.

The application should function as a discovery and filtering interface, not as a replacement for the original publisher.

## Testing

Add tests for:

* Trusted-domain filtering
* Journalist-name normalisation
* Club matching
* Ambiguous club-name handling
* Transfer-status classification
* Reliability scoring
* Duplicate detection
* Query-parameter validation

## README

Create a detailed README covering:

* Product purpose
* Technology
* Installation
* Environment variables
* Mock mode
* News-provider setup
* Trusted-source configuration
* Adding clubs
* Adding journalists
* Reliability methodology
* API limitations
* Copyright and attribution
* Running tests
* Deployment to Vercel

## Implementation process

Work in the following order:

1. Initialise the project structure.
2. Create types and trusted-source configuration.
3. Add club data and aliases.
4. Create realistic demonstration data.
5. Build the responsive application shell.
6. Build onboarding and club selection.
7. Build the dashboard and news cards.
8. Build filters and URL state.
9. Build club pages.
10. Create the provider interface.
11. Implement mock-provider mode.
12. Add filtering, matching and deduplication.
13. Add optional external news providers.
14. Add testing.
15. Add metadata and README.
16. Review accessibility and mobile responsiveness.

Before writing code, first provide:

* Proposed architecture
* Folder structure
* Data flow
* Source-verification approach
* Reliability rules
* Duplicate-detection approach

After presenting the plan, implement the application one section at a time.

Do not leave major components as pseudocode.

Do not silently invent unavailable API data.

When an external API does not provide a journalist, player, club or reliability field, derive it conservatively or return null.

The completed first version must run locally using mock data without requiring any paid service.
