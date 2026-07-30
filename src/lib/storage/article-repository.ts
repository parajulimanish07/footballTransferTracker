import fs from 'fs';
import path from 'path';
import type { RawNewsArticle } from '../news/providers/provider-types';
import type { TransferNewsItem } from '@/types/news';

export interface StoredArticleRecord extends RawNewsArticle {
  firstFetchedAt: string;
  lastFetchedAt: string;
  processingStatus: 'raw' | 'processed' | 'needs_review' | 'rejected';
  mlPrediction?: string;
  confidence?: number;
  reliabilityScore?: number;
  duplicateGroupId?: string | null;
  humanLabel?: string | null;
  humanReviewedAt?: string | null;
  processedNewsItem?: TransferNewsItem | null;
}

const STORAGE_DIR = path.join(process.cwd(), '.data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'articles.json');

// In-memory cache backed by local JSON file
let memoryStore: Map<string, StoredArticleRecord> | null = null;

function loadStore(): Map<string, StoredArticleRecord> {
  if (memoryStore) return memoryStore;

  memoryStore = new Map<string, StoredArticleRecord>();

  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const records: StoredArticleRecord[] = JSON.parse(data);
      records.forEach((rec) => memoryStore!.set(rec.externalId, rec));
    }
  } catch (err) {
    console.error('[ArticleRepository] Error reading articles.json:', err);
  }

  return memoryStore;
}

function saveStore() {
  if (!memoryStore) return;
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    const arrayData = Array.from(memoryStore.values());
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(arrayData, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ArticleRepository] Error writing articles.json:', err);
  }
}

export const articleRepository = {
  get(externalId: string): StoredArticleRecord | undefined {
    return loadStore().get(externalId);
  },

  getByUrl(url: string): StoredArticleRecord | undefined {
    const store = loadStore();
    for (const record of store.values()) {
      if (record.sourceUrl === url) return record;
    }
    return undefined;
  },

  getAll(): StoredArticleRecord[] {
    return Array.from(loadStore().values());
  },

  getHumanReviewedArticles(): StoredArticleRecord[] {
    return Array.from(loadStore().values()).filter((rec) => Boolean(rec.humanLabel));
  },

  saveRawArticle(raw: RawNewsArticle): StoredArticleRecord {
    const store = loadStore();
    const existing = store.get(raw.externalId);
    const now = new Date().toISOString();

    const record: StoredArticleRecord = {
      ...raw,
      firstFetchedAt: existing?.firstFetchedAt || now,
      lastFetchedAt: now,
      processingStatus: existing?.processingStatus || 'raw',
      mlPrediction: existing?.mlPrediction,
      confidence: existing?.confidence,
      reliabilityScore: existing?.reliabilityScore,
      duplicateGroupId: existing?.duplicateGroupId || null,
      humanLabel: existing?.humanLabel || null,
      humanReviewedAt: existing?.humanReviewedAt || null,
      processedNewsItem: existing?.processedNewsItem || null,
    };

    store.set(raw.externalId, record);
    saveStore();
    return record;
  },

  updateProcessedArticle(
    externalId: string,
    update: Partial<StoredArticleRecord>
  ): StoredArticleRecord | undefined {
    const store = loadStore();
    const existing = store.get(externalId);
    if (!existing) return undefined;

    const updated: StoredArticleRecord = {
      ...existing,
      ...update,
      lastFetchedAt: new Date().toISOString(),
    };

    store.set(externalId, updated);
    saveStore();
    return updated;
  },
};
