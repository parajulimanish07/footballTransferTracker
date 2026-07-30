import { NextRequest, NextResponse } from 'next/server';
import { queryRAGAssistant } from '@/lib/rag/rag-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, articles } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const answer = await queryRAGAssistant(question, articles || []);
    return NextResponse.json(answer);
  } catch {
    return NextResponse.json({ error: 'Failed to process RAG query.' }, { status: 500 });
  }
}
