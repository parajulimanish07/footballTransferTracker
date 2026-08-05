export interface EmbeddingProvider {
  id: string;
  dimensions: number;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export class MockEmbeddingProvider implements EmbeddingProvider {
  id = 'mock-provider';
  dimensions = 384;

  async embedText(text: string): Promise<number[]> {
    const vector = new Array(this.dimensions).fill(0);
    const tokens = text.toLowerCase().split(/\s+/);

    tokens.forEach((token, idx) => {
      for (let i = 0; i < token.length; i++) {
        const charCode = token.charCodeAt(i);
        const pos = (charCode * (i + 1) * (idx + 1)) % this.dimensions;
        vector[pos] += 0.1;
      }
    });

    // Normalize L2 norm
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((val) => val / norm);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedText(t)));
  }
}

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  id = 'openai';
  dimensions: number;
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model = 'text-embedding-3-small', dimensions = 1536) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = process.env.EMBEDDING_MODEL || model;
    this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || `${dimensions}`, 10);
  }

  async embedText(text: string): Promise<number[]> {
    const res = await this.embedBatch([text]);
    return res[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      // Fall back to Mock Provider if API key is missing
      const mock = new MockEmbeddingProvider();
      return mock.embedBatch(texts);
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Embedding Error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data.map((item: { embedding: number[] }) => item.embedding);
  }
}

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  id = 'ollama';
  dimensions: number;
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'nomic-embed-text', dimensions = 768) {
    this.baseUrl = process.env.OLLAMA_BASE_URL || baseUrl;
    this.model = process.env.EMBEDDING_MODEL || model;
    this.dimensions = parseInt(process.env.EMBEDDING_DIMENSIONS || `${dimensions}`, 10);
  }

  async embedText(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, prompt: text }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const json = await response.json();
        return json.embedding;
      }
    } catch {
      // Fallback to mock on connection timeout/failure
    }
    const fallback = new MockEmbeddingProvider();
    return fallback.embedText(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embedText(t)));
  }
}

export function getActiveEmbeddingProvider(): EmbeddingProvider {
  const providerType = process.env.EMBEDDING_PROVIDER || 'mock';
  switch (providerType.toLowerCase()) {
    case 'openai':
      return new OpenAIEmbeddingProvider();
    case 'ollama':
      return new OllamaEmbeddingProvider();
    case 'mock':
    default:
      return new MockEmbeddingProvider();
  }
}
