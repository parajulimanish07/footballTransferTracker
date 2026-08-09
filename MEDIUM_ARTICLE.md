# Building a Portfolio-Ready AI Football Transfer Intelligence Platform with Next.js 15, Grounded RAG & Python ML

*By [Your Name]*

Transfer deadline days produce an overwhelming flood of rumors. Headline aggregators are plagued by clickbait, duplicate reports, unverified insider posts, and broken context. 

To solve this, I built the **Football Transfer Intelligence Platform**—a full-stack, AI-powered system designed to aggregate, verify, classify, and ground transfer news reports in real time.

In this article, I’ll walk through the system architecture, NLP clause isolation, machine learning classification, grounded RAG assistant, and the dynamic football entity catalogue powering the application.

---

## 1. System Architecture

The platform combines a **Next.js 15 App Router** frontend and API layer with a **Python FastAPI ML microservice** and an **Explainable Grounded RAG** engine.

```text
                  ┌──────────────────────────────────────────┐
                  │ Next.js 15 App Router Frontend & API     │
                  │ (React 19, TypeScript, Tailwind CSS)     │
                  └────────────────────┬─────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
│ Ingestion Engine  │        │ Entity Catalogue  │        │ RAG & Grounded AI │
│ - BBC Sport RSS   │        │ - Local Repo      │        │ - Hybrid Search   │
│ - Guardian RSS    │        │ - Sync Engine     │        │ - Prompt Defense  │
│ - Official Feeds  │        │ - 5-Tier Fallback │        │ - Citation Check  │
└────────┬──────────┘        └─────────┬─────────┘        └─────────┬─────────┘
         │                             │                            │
         └─────────────────────────────┼────────────────────────────┘
                                       ▼
                     ┌───────────────────────────────────┐
                     │ Python FastAPI ML Service         │
                     │ - Linear SVM / Logistic Reg       │
                     │ - TF-IDF N-gram Feature Extractor │
                     │ - Cosine Similarity Deduplication │
                     └───────────────────────────────────┘
```

---

## 2. Multi-Source Ingestion & Reliability Scoring

News sources are ingested via clean adapter interfaces (`TransferSourceAdapter`). We pull from:
- **BBC Sport RSS & The Guardian API** (Tier 1 Verified News)
- **Official Club Press Releases** (Real Madrid, Liverpool, Arsenal, Man City)
- **Insider Social Adapters** (Whitelisted journalist accounts)

Each article is assigned a deterministic **Reliability Score (0–100)**:
$$\text{Reliability} = \text{Base Authority} + \text{Tier-1 Author Bonus} - \text{Recency Decay}$$

Official club announcements receive a 100 base score, while Tier 1 journalists like David Ornstein or Fabrizio Romano add author authority bonuses.

---

## 3. Clause-Level NLP Entity Resolution & 5-Tier Fallback

Transfer roundups often pack multiple player claims into a single article. Naive entity extraction mixes up origin and destination clubs across sentences.

To fix this, our NLP pipeline breaks text into sentence clauses (`extractTransferClaims`) and resolves player movements using a strict 5-tier fallback priority:

1. **Explicit Verified Article Evidence:** Preposition patterns like `"joins Leeds from Man City"` extract player (`Trafford`), origin (`manchester-city`), and destination (`leeds-united`).
2. **Local Player Entity Catalogue:** Queries the cached entity catalogue (`.data/football-entities.json`) for `currentClubId`.
3. **Reviewed Aliases:** Exact alias matches against 38 supported clubs.
4. **Legacy Static Fallback:** Secondary dictionary mapping.
5. **Unknown / Ambiguous Gate:** Rejects risky generic terms like `"United"` or `"City"` unless clause context explicitly disambiguates them.

---

## 4. Machine Learning Status Classification

To classify whether an article represents an `Official` signing, `Agreement Reached`, `Bid Submitted`, or `Interest Reported`, we trained a calibrated **Linear SVM** and **Logistic Regression** baseline model in Python using `scikit-learn`.

- **Feature Extraction:** TF-IDF vectorizer analyzing 1–2 n-grams (`"submitted bid"`, `"formal offer"`, `"agree new six-year deal"`).
- **Explainable AI Modal:** Renders real-time TF-IDF feature importance signals directly in the UI so users can inspect why a news item received its label.

---

## 5. Grounded Hybrid RAG Assistant

The interactive AI Transfer Assistant uses a composite retrieval weighting formula:
$$\text{Score} = 0.40 \times \text{Semantic} + 0.25 \times \text{Keyword} + 0.20 \times \text{Reliability} + 0.15 \times \text{Recency}$$

Responses are strictly grounded in retrieved news context, backed by source citations, and protected by context sanitization against prompt injection attacks.

---

## 6. Verification & Quality Assurance

- **145 Passing Unit Tests** across 17 test suites in Vitest.
- **Zero TypeScript Errors** (`npx tsc --noEmit`).
- **ESLint 9 Flat Configuration** passing.
- **100% Successful Next.js 15 Production Build** (36 static routes compiled).

---

## Conclusion & Open Source

This project demonstrates how modern full-stack TypeScript, classical NLP/ML, and Grounded RAG can solve real-world content noise.

- **GitHub Repository:** [Link to your repo]
- **Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Python FastAPI, scikit-learn, Vitest.
