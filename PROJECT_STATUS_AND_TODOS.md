# Football Transfer Intelligence Platform — System Audit, Status & Deployment TODOs

This document details **what is working perfectly right now** in the codebase and provides a **production deployment checklist (TODOs)** required before hosting the application live on the web.

---

## 🟢 1. What is Working Perfectly Right Now

The codebase is fully built, cleanly typed in TypeScript (Next.js 15 App Router), and verified by **121 passing automated unit tests** across 16 test suites.

### 1.1 Ingestion & Source Adapters (`src/lib/news/providers/`)
- ✅ **Common Source Adapter Interface (`source-adapter.ts`):** `TransferSourceAdapter`, `TransferSourceQuery`, and `RawTransferSourceItem` unify all raw data formats into a single pipeline.
- ✅ **BBC Sport Football RSS (`rss-provider.ts`):** Live RSS feed parser for BBC Sport Football.
- ✅ **The Guardian Open Platform API (`guardian-provider.ts`):** Guardian API integration searching transfer keywords, bylines, and media thumbnails.
- ✅ **Official Club RSS Feeds (`official-club-sources.ts`):** Ingestion for official club announcements (Liverpool, Real Madrid, Arsenal, Manchester City) with domain validation.
- ✅ **Official X API Source Adapter (`x-provider.ts`):** Official X API v2 search adapter using server-side bearer token (`X_API_BEARER_TOKEN`), account whitelist polling, rate limit backoff, and silent fallback when disabled.
- ✅ **Manual Social Import Studio (`/admin/import-social`):** Protected admin interface allowing editors to submit social posts from approved accounts when API access is limited.
- ✅ **Multi-Source Orchestrator (`multi-source-orchestrator.ts`):** Failure-isolated parallel execution (`Promise.allSettled`), exact URL deduplication, and `SourceHealthResult` telemetry.

### 1.2 Data Integrity & Source Verification (`src/config/source-registry.ts`)
- ✅ **Centralized Source Registry (`source-registry.ts`):** Defines trusted publishers (BBC, Guardian, Sky Sports), approved journalists (Fabrizio Romano, David Ornstein, Gianluca Di Marzio, Florian Plettenberg), and official clubs with reliability tiers (`official`, `tier_1`, `tier_2`, `trusted`).
- ✅ **Trusted Source Filtering (`filter-trusted-sources.ts`):** Validates article domain and author byline against registry rules, rejecting unverified clickbait sources.

### 1.3 Machine Learning & Entity Extraction (`src/lib/news/`)
- ✅ **Sentence-Level Entity Resolution (`resolve-transfer-entities.ts`):** Sentence-boundary parsing that isolates transfer claims to prevent entity cross-contamination in gossip roundups.
- ✅ **Default Origin Club Fallback (`KNOWN_PLAYER_ORIGIN_CLUBS`):** Automatically maps known players (e.g. `Mohamed Salah` $\rightarrow$ `Liverpool`, `Bruno Guimaraes` $\rightarrow$ `Newcastle United`, `Victor Osimhen` $\rightarrow$ `Napoli`).
- ✅ **Expanded International Clubs (`src/config/clubs.ts`):** Includes Süper Lig, Saudi Pro League, and Primeira Liga clubs (`Trabzonspor`, `Fenerbahce`, `Galatasaray`, `Al-Ittihad`, `Al-Nassr`, `Sporting CP`).
- ✅ **Transfer Status Classification (`classify-transfer-status.ts`):** Fast rule-based classifier + Python FastAPI ML microservice fallback (`ml-service/`).
- ✅ **TF-IDF Phrase Deduplication (`deduplicate-news.ts`):** N-gram cosine similarity (`ngram_range=(1,2)`).

### 1.4 Vector Embeddings & Grounded Hybrid RAG Pipeline (`src/lib/rag/`)
- ✅ **Persistent Article Repository (`article-repository.ts`):** `StoredTransferArticle` repository with PostgreSQL/pgvector support and SHA-256 content hashing to eliminate duplicate embedding generation.
- ✅ **Embedding Provider Abstraction (`embedding-provider.ts`):** Configurable embedding provider (`MockEmbeddingProvider`, `OpenAIEmbeddingProvider`, `OllamaEmbeddingProvider`).
- ✅ **Grounded Hybrid RAG Search Engine (`hybrid-search-engine.ts`):** Hybrid reranking formula: **40% Semantic Similarity + 25% Keyword Match + 20% Reliability + 15% Recency**.
- ✅ **Search Intent Parser (`intent-parser.ts`):** Extracts structured intent (`questionType`, `playerName`, `clubIds`, `leagueIds`, `requestedStatuses`).
- ✅ **Security & Prompt Injection Isolation (`rag-engine.ts`):** Isolates article evidence inside system prompts and validates LLM answers with Zod (`GroundedTransferAnswer`).
- ✅ **Player Transfer Timelines (`player-timeline.ts`):** Chronological progression timelines for player transfer sagas.

### 1.5 Provenance & Early Signal System (`src/lib/news/confidence-progression.ts`)
- ✅ **Evidence Level Labeling (`determineEvidenceLevel`):** `official_confirmation`, `trusted_report`, `early_signal`, `secondary_confirmation`. Insider social posts are tagged as `early_signal` or `trusted_report`, keeping `OFFICIAL` strictly for official club media announcements.
- ✅ **Provenance & Repost Grouping (`SourceProvenance`):** Groups reposts and quote posts around the primary original report without counting reposts as independent confirmation.
- ✅ **Contradiction & Update Detection (`detectReportRelationship`):** Detects phrases like "correction", "talks collapsed", "bid rejected".

### 1.6 Frontend UI/UX Architecture & Performance
- ✅ **Minimal Content-First Navigation:** 4 top-level items (`Home`, `Leagues`, `Following`, `More`).
- ✅ **Browse All Transfer News Mode (`/dashboard?mode=global`):** Default feed showing verified transfer news across all clubs without forcing onboarding selection.
- ✅ **Following Feed (`/following`):** Personalised feed for followed teams.
- ✅ **Supported Leagues Directory (`/leagues` & `/league/[slug]`):** League hubs for Premier League, La Liga, Serie A, Bundesliga, Ligue 1.
- ✅ **Clean Trending Targets Widget (`trending-players.tsx`):** Redesigned layout displaying full player names and club labels without text squishing.
- ✅ **Contextual Entity Highlight Strip (`transfer-news-card.tsx`):** Displays `Mohamed Salah • Liverpool ➔ Trabzonspor` or `Mohamed Salah • Transfer Target Reported`.
- ✅ **Permanent Dark Mode:** Clean, sleek dark theme (`color-scheme: dark;`).

---

## 🚀 2. TODOs Before Hosting Live (Production Deployment Plan)

To host the application live on production infrastructure (e.g. Vercel / Railway / Render / AWS / Supabase), follow this step-by-step preparation checklist.

```mermaid
graph TD
  A[Step 1: Production Environment Variables] --> B[Step 2: Production PostgreSQL + pgvector DB]
  B --> C[Step 3: Serverless Embedding & LLM API Keys]
  C --> D[Step 4: Build & Deployment on Host Platform]
  D --> E[Step 5: Domain SSL & Telemetry Monitoring]
```

### Phase 1: Environment Variables Configuration (`.env.production`)
- [ ] **Configure Production LLM Provider:**
  Set `LLM_PROVIDER=openai`, `OPENAI_API_KEY=sk-...`, and `LLM_MODEL=gpt-4o-mini`.
- [ ] **Configure Production Embedding Provider:**
  Set `EMBEDDING_PROVIDER=openai`, `EMBEDDING_MODEL=text-embedding-3-small`, and `EMBEDDING_DIMENSIONS=1536` (or `EMBEDDING_PROVIDER=ollama` if hosting custom Ollama instance).
- [ ] **Configure News API Keys:**
  Set `GUARDIAN_API_KEY`, `GNEWS_API_KEY`, and `NEWS_API_KEY` in production host dashboard.
- [ ] **Optional X API Integration:**
  Set `X_API_ENABLED=true` and `X_API_BEARER_TOKEN=AAAA...` if active X API developer access is enabled, or leave `X_API_ENABLED=false` to use manual social import (`/admin/import-social`).

### Phase 2: Production Database (PostgreSQL + pgvector)
- [ ] **Provision Managed PostgreSQL Database:**
  Deploy a managed PostgreSQL 15+ database (e.g. Supabase, Neon.tech, Railway, AWS RDS).
- [ ] **Enable `pgvector` Extension:**
  Run SQL migration: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] **Configure Database Connection String:**
  Set `DATABASE_URL=postgres://user:pass@host:5432/dbname` in host environment settings.

### Phase 3: Production Deployment (Vercel / Railway / Docker)
- [ ] **Deploy Next.js App on Vercel or Railway:**
  - Option A (Vercel): Connect GitHub repository to Vercel, set build command `npm run build`, and add environment variables.
  - Option B (Docker / Railway): Deploy container with Node 20 runtime and environment variables.
- [ ] **Configure Python ML Microservice (Optional):**
  If using the Python Linear SVM classifier in production, deploy `ml-service/` to Railway/Render and set `ML_SERVICE_URL=https://your-ml-service.up.railway.app`. (If disabled, local JS rules act as primary classifier).

### Phase 4: Production Verification & Domain Setup
- [ ] **Custom Domain & SSL:**
  Attach custom domain (e.g. `transfertracker.com`) with automatic SSL certificate.
- [ ] **Production Feed Sync Cron Job:**
  Set up a scheduled cron job (Vercel Cron / GitHub Action / Railway Cron) calling `GET /api/cron/sync-news` every 10–15 minutes to automatically trigger multi-source ingestion.
- [ ] **Verify Live Performance:**
  Audit live page load speeds, SWR background revalidation, and RAG assistant responses under real traffic.
