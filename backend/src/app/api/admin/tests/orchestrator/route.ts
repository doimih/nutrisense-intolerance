import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { runOrchestrator } from '@/ai/orchestrator';
import type { OrchestratorContext, OrchestratorResult } from '@/ai/orchestrator';
import { logOrchestratorEvent } from '@/lib/server/superadmin/aiLogging';

export const runtime = 'nodejs';

function sid(req: NextRequest): string {
  return req.headers.get('x-nutriaid-session-id') || req.cookies.get('na_sid')?.value || randomUUID();
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  const userMessage = typeof raw['userMessage'] === 'string' && raw['userMessage'].trim()
    ? raw['userMessage'].trim()
    : null;
  if (!userMessage) return NextResponse.json({ error: '"userMessage" is required.' }, { status: 400 });

  const sessionId = sid(request);

  const rawLang = typeof raw['lang'] === 'string' && raw['lang'] === 'en' ? 'en' : 'ro';

  const ctx: OrchestratorContext = {
    sessionId,
    userId: auth.session.userId,
    userMessage,
    lang: rawLang,
    userProfile: (raw['userProfile'] as OrchestratorContext['userProfile']) ?? {},
    intolerances: Array.isArray(raw['intolerances']) ? (raw['intolerances'] as string[]) : [],
    allergies: Array.isArray(raw['allergies']) ? (raw['allergies'] as string[]) : [],
    nutritionalGoals: (raw['nutritionalGoals'] as OrchestratorContext['nutritionalGoals']) ?? undefined,
  };

  const startedAt = Date.now();
  let result: OrchestratorResult;
  try {
    result = await runOrchestrator(ctx);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logOrchestratorEvent({
      sessionId,
      userId: auth.session.userId,
      intent: null,
      workerSequence: [],
      executionMs: Date.now() - startedAt,
      error: { message: msg },
    });
    return NextResponse.json({ error: `Orchestrator failed: ${msg}` }, { status: 500 });
  }

  // Build a test-lab-friendly summary
  const workerSummaries = result.workerResults.map(({ workerId, supervisionReport: r, totalMs }) => ({
    workerId,
    schemaValid: r.schemaValid,
    semanticValid: r.semanticValid,
    corrected: r.corrected,
    correctionIncomplete: r.correctionIncomplete,
    correctionModel: r.correctionModel,
    errors: r.errors,
    finalOutput: r.finalOutput,
    totalMs,
  }));

  return NextResponse.json({
    sessionId,
    intent: result.intent,
    workerSequence: result.workerSequence,
    workerSummaries,
    finalResponse: result.finalResponse,
    totalMs: result.totalMs,
    hasErrors: result.hasErrors,
  });
}
