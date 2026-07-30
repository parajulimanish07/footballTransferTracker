'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import type { GroundedAnswer } from '@/lib/llm/llm-provider';

export function RAGAssistantWidget({
  articles,
}: {
  articles: Array<{ id: string; headline: string; summary: string; sourceName: string; sourceUrl: string }>;
}) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundedAnswer | null>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, articles }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }

  const suggestedQuestions = [
    'Is this transfer officially confirmed?',
    'What has changed recently?',
    'Who first reported this deal?',
  ];

  return (
    <div className="glass-card rounded-3xl p-5 border border-accent-emerald/20 shadow-soft">
      <div className="flex items-center gap-2 font-display text-base font-bold text-text">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 shadow-emeraldGlow">
          <Bot className="h-4.5 w-4.5" />
        </span>
        <div>
          <span>Ask Transfer Assistant</span>
          <span className="block text-[10px] font-normal text-muted">Grounded RAG Q&amp;A on Trusted Reports</span>
        </div>
      </div>

      {/* Suggested chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuestion(q)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:text-text hover:bg-white/10 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Question Form */}
      <form onSubmit={handleAsk} className="mt-3.5 relative">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about current transfers..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-4 pr-11 py-2.5 text-xs text-text placeholder:text-muted focus:border-accent-emerald focus:outline-none focus:ring-1 focus:ring-accent-emerald transition-all"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-accent-emerald text-slate-950 disabled:opacity-50 transition-all hover:bg-emerald-400"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Answer Container */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2 py-4 text-xs text-muted">
          <Sparkles className="h-4 w-4 text-accent-emerald animate-spin" />
          <span>Searching verified reports &amp; generating answer...</span>
        </div>
      )}

      {result && !loading && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-semibold text-text">
            <span className="flex items-center gap-1.5 text-accent-emerald">
              <ShieldCheck className="h-4 w-4" /> Grounded Answer
            </span>
            <span className="text-[10px] uppercase font-bold text-muted">Confidence: {result.confidence}</span>
          </div>

          <p className="leading-relaxed text-slate-200">{result.answer}</p>

          {result.citedArticles?.length ? (
            <div className="pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-muted block mb-1.5">Cited Evidence Reports:</span>
              <div className="space-y-1.5">
                {result.citedArticles.map((cite) => (
                  <a
                    key={cite.id}
                    href={cite.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-[11px] text-text hover:bg-white/10 transition-colors"
                  >
                    <span className="font-semibold truncate max-w-[200px]">{cite.headline}</span>
                    <span className="inline-flex items-center gap-1 text-accent-emerald font-bold">
                      {cite.sourceName} <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
