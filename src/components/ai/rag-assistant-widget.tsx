'use client';

import { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Maximize2,
  Minimize2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import type { GroundedAnswer } from '@/lib/llm/llm-provider';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  groundedResult?: GroundedAnswer;
  timestamp: string;
}

export function RAGAssistantWidget({
  articles,
}: {
  articles: Array<any>;
}) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleAsk(queryText?: string) {
    const q = (queryText || question).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, articles }),
      });

      if (response.ok) {
        const data: GroundedAnswer = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer,
          groundedResult: data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Unable to reach verified report RAG engine. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  const suggestedQuestions = [
    'Is this transfer confirmed?',
    'Who first reported this deal?',
    'What is the reported fee?',
    'What has changed recently?',
  ];

  return (
    <>
      {/* Compact Sidebar / Panel Widget */}
      <div className="glass-card relative rounded-3xl p-5 border border-accent-emerald/20 shadow-soft overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 shadow-emeraldGlow">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5 font-display text-sm font-extrabold text-text">
                <span>AI Transfer Assistant</span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
              </div>
              <span className="block text-[10px] font-medium text-muted">Grounded RAG Q&amp;A on Verified News</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted hover:text-text hover:bg-white/10 transition-colors"
            title="Expand Research Studio"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Suggestion Chips (Horizontal Scrollable) */}
        <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleAsk(q)}
              className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 hover:text-text hover:bg-accent-emerald/10 hover:border-accent-emerald/30 transition-all"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="mt-3.5 relative"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a transfer question..."
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

        {/* Latest Response Stream */}
        {loading && (
          <div className="mt-3.5 flex items-center justify-center gap-2 rounded-2xl border border-accent-emerald/20 bg-accent-emerald/5 py-3 text-xs text-accent-emerald">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Searching &amp; generating grounded answer...</span>
          </div>
        )}

        {messages.length > 0 && !loading && (
          <div className="mt-3.5 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {messages.slice(-2).map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl p-3 text-xs space-y-1.5 ${
                  msg.sender === 'user'
                    ? 'border border-white/10 bg-white/5 text-text ml-4'
                    : 'border border-accent-emerald/20 bg-accent-emerald/5 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="font-bold uppercase text-accent-emerald">
                    {msg.sender === 'user' ? 'You' : 'Grounded Assistant'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>

                {msg.groundedResult?.citedArticles?.length ? (
                  <div className="pt-1.5 border-t border-white/5 space-y-1">
                    <span className="text-[10px] font-bold text-muted block">Evidence Cited:</span>
                    {msg.groundedResult.citedArticles.slice(0, 2).map((cite) => (
                      <a
                        key={cite.id}
                        href={cite.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between text-[11px] text-accent-emerald hover:underline truncate"
                      >
                        <span className="truncate">{cite.headline}</span>
                        <ExternalLink className="h-3 w-3 shrink-0 ml-1" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expanded AI Research Modal / Drawer */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel relative w-full max-w-2xl rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-text">AI Transfer Research Studio</h3>
                  <p className="text-xs text-muted">Grounded Retrieval-Augmented Generation (RAG) Assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-muted hover:text-text hover:bg-white/10"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Thread */}
            <div className="h-80 overflow-y-auto space-y-3 pr-2 scrollbar-none">
              {!messages.length && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted space-y-2">
                  <MessageSquare className="h-8 w-8 text-accent-emerald/40" />
                  <p className="text-xs">Ask any transfer question. Answers are backed strictly by verified news.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-2xl p-4 text-xs space-y-2 ${
                    msg.sender === 'user'
                      ? 'border border-white/10 bg-white/5 text-text max-w-[85%] ml-auto'
                      : 'border border-accent-emerald/20 bg-accent-emerald/10 text-slate-200 max-w-[90%]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span className="font-bold text-accent-emerald uppercase">{msg.sender === 'user' ? 'You' : 'Grounded AI'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="relative pt-2"
            >
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about player fees, contract talks, or official announcements..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-4 pr-12 py-3 text-xs text-text focus:border-accent-emerald focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-xl bg-accent-emerald text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
