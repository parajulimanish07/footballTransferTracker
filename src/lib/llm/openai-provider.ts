import {
  LLMProvider,
  LLMArticleInput,
  TransferArticleAnalysis,
  TransferArticleAnalysisSchema,
  GroundedAnswer,
  GroundedAnswerSchema,
} from './llm-provider';

export class OpenAIProvider implements LLMProvider {
  name = 'openai';

  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY;
  }

  async analyseTransferArticle(article: LLMArticleInput): Promise<TransferArticleAnalysis> {
    if (this.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'You are a precise sports journalism AI. Extract transfer information accurately in JSON format without inventing facts.',
              },
              {
                role: 'user',
                content: `Analyse this transfer article:\nHeadline: ${article.headline}\nSummary: ${article.summary}\nSource: ${article.sourceName}`,
              },
            ],
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const json = await response.json();
          const parsed = JSON.parse(json.choices[0].message.content);
          const validated = TransferArticleAnalysisSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      } catch {
        // Fallback to deterministic extraction on API failure or validation error
      }
    }

    return this.fallbackAnalysis(article);
  }

  async answerTransferQuestion(question: string, context: LLMArticleInput[]): Promise<GroundedAnswer> {
    if (this.apiKey && context.length > 0) {
      try {
        const contextStr = context
          .map((a, i) => `[Source ${i + 1} - ${a.sourceName}]: ${a.headline} - ${a.summary}`)
          .join('\n');

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content:
                  'Answer user questions about transfer news using ONLY the provided context reports. Do NOT use un-cited external knowledge. Return JSON.',
              },
              {
                role: 'user',
                content: `Question: ${question}\n\nContext Reports:\n${contextStr}`,
              },
            ],
          }),
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const json = await response.json();
          const parsed = JSON.parse(json.choices[0].message.content);
          const validated = GroundedAnswerSchema.safeParse(parsed);
          if (validated.success) {
            return validated.data;
          }
        }
      } catch {
        // Fallback
      }
    }

    return this.fallbackGroundedAnswer(question, context);
  }

  private fallbackAnalysis(article: LLMArticleInput): TransferArticleAnalysis {
    const text = `${article.headline} ${article.summary}`;

    const keyClaims: string[] = [];
    if (text.toLowerCase().includes('bid') || text.toLowerCase().includes('offer')) {
      keyClaims.push('A formal offer/bid has been reported');
    }
    if (text.toLowerCase().includes('agree') || text.toLowerCase().includes('terms')) {
      keyClaims.push('Personal terms or club agreement reached');
    }
    if (!keyClaims.length) {
      keyClaims.push('Initial discussions or interest reported');
    }

    return {
      summary: article.summary || article.headline,
      playerName: this.extractPlayerName(text),
      currentClub: null,
      destinationClub: null,
      reportedFee: this.extractFee(text),
      direction: 'related',
      keyClaims,
      uncertainty: text.toLowerCase().includes('rumour') || text.toLowerCase().includes('speculation') ? 'high' : 'low',
    };
  }

  private fallbackGroundedAnswer(question: string, context: LLMArticleInput[]): GroundedAnswer {
    if (!context.length) {
      return {
        answer: 'There are no trusted reports available in the database regarding this query.',
        citedArticles: [],
        confidence: 'low',
        evidenceFound: false,
      };
    }

    const first = context[0];
    return {
      answer: `Based on the latest trusted report from ${first.sourceName}: "${first.headline}". ${first.summary}`,
      citedArticles: context.slice(0, 3).map((a) => ({
        id: a.id || '1',
        headline: a.headline,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl || '#',
      })),
      confidence: 'high',
      evidenceFound: true,
    };
  }

  private extractPlayerName(text: string): string | null {
    const knowns = ['Declan Rice', 'Riccardo Calafiori', 'Darwin Nunez', 'Kylian Mbappe', 'Joshua Zirkzee', 'Victor Osimhen', 'Moises Caicedo', 'Leny Yoro', 'Teun Koopmeiners', 'Luis Diaz'];
    return knowns.find((name) => text.toLowerCase().includes(name.toLowerCase())) ?? null;
  }

  private extractFee(text: string): string | null {
    const match = text.match(/£\d+m|€\d+m|\$\d+m/i);
    return match ? match[0] : null;
  }
}

export const defaultLLMProvider = new OpenAIProvider();
