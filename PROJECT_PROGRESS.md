# Transfer Tracker — AI-Powered Football Transfer Intelligence Platform
## Comprehensive Development & Feature Progress Summary

---

## 1. 🔒 Security & Configuration Hardening

### API Key Isolation & Environment Security
- **What We Built:** Removed hard-coded secrets from the codebase, configured `.env.local` for server-side API keys (`NEWS_API_KEY`, `GUARDIAN_API_KEY`, `GNEWS_API_KEY`, `LLM_API_KEY`), and added strict `.gitignore` rules.
- **Layman's Explanation:** Keeps sensitive passwords and API access keys strictly private so nobody on the internet can steal or misuse them.

---

## 2. 🌐 Multi-Source News Ingestion Engine

### BBC Sport Football RSS Provider
- **What We Built:** Server-side XML RSS feed parser for BBC Sport Football (`http://feeds.bbci.co.uk/sport/football/rss.xml`). Preserves required attribution and links directly to original BBC reports without scraping full article bodies.
- **Layman's Explanation:** Automatically fetches official football news directly from BBC Sport as soon as it is published.

### The Guardian Open Platform API Provider
- **What We Built:** Integration with The Guardian Content API (`section=football`) searching for transfer keywords, bylines, trail text, and thumbnails.
- **Layman's Explanation:** Scans The Guardian’s sports desk in real time to catch high-quality transfer stories and journalist reports.

### Official Football Club RSS & Press Release Provider
- **What We Built:** Ingestion provider pulling official announcements from verified club feeds (e.g. Liverpool, Arsenal, Real Madrid) with domain validation.
- **Layman's Explanation:** Reads news directly from the official websites of major football clubs to verify when a deal is 100% real.

### GNews Discovery Provider
- **What We Built:** Optional search provider querying global news sources for specific club names and transfer keywords.
- **Layman's Explanation:** Acts like a specialized search engine to discover breaking transfer stories from around the world.

### Manual Trusted Article Import Tool (`/admin/import`)
- **What We Built:** Protected admin page allowing reviewers to submit verified news reports with URL formatting, duplicate URL, and trusted-publisher validation.
- **Layman's Explanation:** Lets an editor manually paste an important transfer story from Twitter or a trusted newspaper so it appears immediately on the platform.

### Resilient Multi-Provider Orchestrator (`Promise.allSettled`)
- **What We Built:** Orchestrator running all active providers simultaneously using `Promise.allSettled`, with error isolation, exact URL deduplication, primary story selection (Official > Tier 1 > Reliability > Recency), and provider health telemetry.
- **Layman's Explanation:** Ensures that if one news website goes down or experiences a glitch, the app keeps fetching news smoothly from all other working sources.

---

## 3. 🐍 Machine Learning & Text Classification Microservice (`ml-service/`)

### Supervised Transfer-Status Classifier (Logistic Regression & Linear SVM)
- **What We Built:** Python FastAPI microservice trained on transfer headline patterns to classify news into 9 categories (`OFFICIAL`, `AGREEMENT_REACHED`, `ADVANCED_TALKS`, `NEGOTIATIONS`, `BID_SUBMITTED`, `APPROACH_MADE`, `INTEREST`, `DEPARTURE_EXPECTED`, `NOT_TRANSFER_NEWS`).
- **Layman's Explanation:** An intelligent AI model that reads news headlines and automatically determines whether a player has actually signed, is in talks, or is just a rumor.

### TF-IDF Term Vectorization & Text Preprocessing
- **What We Built:** Text cleaning and TF-IDF n-gram vectorizer (`ngram_range=(1,2)`) converting raw transfer headlines into mathematical feature vectors.
- **Layman's Explanation:** Converts words like "agree personal terms" or "submit £40m proposal" into numbers so the computer can understand the exact stage of a transfer.

### Model Evaluation Pipeline & Metrics Endpoint
- **What We Built:** Automatic model comparison selecting between Logistic Regression and Linear SVM based on **Macro F1-score**, exposing accuracy, precision, recall, and confusion matrices via `GET /model-metrics`.
- **Layman's Explanation:** Tests different AI algorithms against each other and automatically picks the smartest one that makes the fewest mistakes.

### Sentence-Level Entity Resolution & Gossip Roundup Resolver
- **What We Built:** Added sentence-level possessive regex parsing (`"Manchester City's Rodri"`) and multi-story roundup detection to accurately extract current and destination clubs without falsely mixing teams across different rumor bullet points.
- **Layman's Explanation:** Ensures multi-rumor gossip articles (which mention 4 different players and 6 teams) don't get mixed up, accurately pairing each player with their true current team and target team.

---

## 4. 🤖 Retrieval-Augmented Generation (RAG) & LLM Intelligence

### Grounded RAG Transfer Assistant (`/api/rag/ask`)
- **What We Built:** Interactive AI chatbot embedded in the dashboard sidebar that retrieves relevant verified articles, ranks them by reliability and recency, and generates grounded answers.
- **Layman's Explanation:** A smart assistant you can ask questions like "Is Osimhen signing for Chelsea?" and get an answer backed by real news articles.

### Structured LLM Extraction & Zero-Hallucination Guardrails
- **What We Built:** OpenAI LLM provider running with low temperature (`0.1`) and strict Zod schema validation to extract key claims, player names, and fees without fabricating facts.
- **Layman's Explanation:** Prevents the AI from making up fake transfer rumors by forcing it to strictly summarize real, published facts.

---

## 5. 💡 Source Reliability & Explainable AI (XAI)

### Transparent Reliability Scoring Engine & Badges
- **What We Built:** Scoring formula combining Source Tier (40%), Journalist Authority (30%), Cross-confirmation (20%), and Recency (10%) to assign badges (`Official Club`, `Tier 1 Journalist`, `Trusted Outlet`).
- **Layman's Explanation:** Gives every news story a credibility score out of 100 so you instantly know if a story is from a top tier journalist or a clickbait blog.

### Explainable AI "Why this label?" Modal
- **What We Built:** Modal window on news cards showing model confidence percentages, key matching TF-IDF phrases, applied rule overrides, and reliability score breakdowns.
- **Layman's Explanation:** A pop-up window that explains exactly why the AI labeled a story as "Advanced Talks" instead of just a rumor.

### Public Source Reliability Directory (`/sources`)
- **What We Built:** Searchable and filterable directory listing approved media outlets, tier levels, reliability scores, specialist club focus, and scoring methodology notes.
- **Layman's Explanation:** A public index where users can look up any sports newspaper or reporter to check how reliable they are.

---

## 6. 🛠️ Editorial Quality Control & Data Governance

### Data-Labelling Workbench (`/admin/labelling`)
- **What We Built:** Human-in-the-loop labelling page with keyboard shortcuts (**Keys 1–9** to label, **[S]** to skip), queue progress tracking, and CSV dataset export.
- **Layman's Explanation:** A tool for human editors to quickly tag incoming news stories to teach and improve the AI model.

### Human Review Queue (`/admin/review`)
- **What We Built:** Audit queue for low-confidence ML predictions (`NEEDS_REVIEW`), missing author bylines, unmatched player entities, and duplicate story merging.
- **Layman's Explanation:** A safety net where uncertain or tricky news stories are flagged for a human editor to double-check before being shown.

### Reviewed Ground-Truth Dataset Exporter (`/api/admin/export-dataset`)
- **What We Built:** Server-side API exporting **only** human-confirmed ground-truth labels into a clean CSV format for retraining the Python ML classifier.
- **Layman's Explanation:** Downloads a clean spreadsheet of human-verified news data so you can easily retrain and upgrade the AI over time.

---

## 7. 🎨 User Interface, Telemetry & Customizations

### PitchPulse Command Center & Club Switcher
- **What We Built:** Main dashboard featuring 1-tap club switching tabs, search toolbar, transfer status filters, and player movement cards.
- **Layman's Explanation:** A modern, clean homepage where you can filter transfer news specifically for your favorite team in one click.

### Live AI Telemetry & Provider Monitoring Dashboard (`/analytics` & `/admin/providers`)
- **What We Built:** Real-time analytics dashboards showing provider health, sync status, article ingestion stats, rejection rates, transfer status distributions, and ML confidence spreads.
- **Layman's Explanation:** A live control dashboard showing how many news stories were fetched, how many clickbait stories were blocked, and how healthy the systems are.

### Light Mode & High-Contrast Theme Engine
- **What We Built:** 1-click **Sun/Moon** toggle switching between sleek Dark Mode and high-contrast Light Mode (`#ffffff` panels, `#f8fafc` background, `#0f172a` text) with `localStorage` persistence.
- **Layman's Explanation:** Allows users to switch between dark and light themes so the app is comfortable to read during the day or at night.

### Montserrat Premium Typography
- **What We Built:** High-performance Google Fonts integration enforcing **Montserrat** as the single primary font across all headings, body text, badges, cards, and inputs.
- **Layman's Explanation:** Uses a modern, ultra-clean font style so all text looks crisp, professional, and easy to read.
