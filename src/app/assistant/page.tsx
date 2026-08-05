import Link from 'next/link';
import { ArrowLeft, Bot } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { MobileNavigation } from '@/components/layout/mobile-navigation';
import { RAGAssistantWidget } from '@/components/ai/rag-assistant-widget';

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      <AppHeader />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        {/* Hero Header */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
            <Bot className="h-4 w-4" />
            <span>AI Transfer Intelligence Assistant</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Ask AI Transfer Assistant
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
            Ask questions about transfer claims, rumors, contract details, and official club moves. Answers are strictly grounded in verified Tier-1 sports reports.
          </p>
        </section>

        {/* RAG Assistant Widget Container */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <RAGAssistantWidget articles={[]} />
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
