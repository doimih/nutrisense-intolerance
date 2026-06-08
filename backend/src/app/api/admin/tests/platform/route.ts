import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { runOrchestrator } from '@/ai/orchestrator';
import type { OrchestratorContext, OrchestratorResult } from '@/ai/orchestrator';
import { logOrchestratorEvent, logInfo } from '@/lib/server/superadmin/aiLogging';

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
  const userMessage = typeof raw['userMessage'] === 'string' ? raw['userMessage'].trim() : '';
  if (!userMessage) return NextResponse.json({ error: '"userMessage" is required.' }, { status: 400 });

  const sessionId = sid(request);

  // Log the incoming frontend payload
  logInfo({
    sessionId,
    userId: auth.session.userId,
    source: 'frontend',
    metadata: {
      event: 'platform_test_started',
      userMessage,
      userProfile: raw['userProfile'] ?? null,
      intolerances: raw['intolerances'] ?? [],
      allergies: raw['allergies'] ?? [],
    },
  });

  const ctx: OrchestratorContext = {
    sessionId,
    userId: auth.session.userId,
    userMessage,
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
    return NextResponse.json({ error: `Platform test failed: ${msg}` }, { status: 500 });
  }

  const stages = [
    {
      stage: 'frontend',
      payload: { userMessage, userProfile: ctx.userProfile, intolerances: ctx.intolerances, allergies: ctx.allergies },
    },
    {
      stage: 'orchestrator_routing',
      intent: result.intent,
      workerSequence: result.workerSequence,
    },
    {
      stage: 'worker_chain',
      workers: result.workerResults.map(({ workerId, supervisionReport: r, totalMs }) => ({
        workerId,
        schemaValid: r.schemaValid,
        semanticValid: r.semanticValid,
        corrected: r.corrected,
        correctionModel: r.correctionModel,
        errors: r.errors,
        finalOutput: r.finalOutput,
        totalMs,
      })),
    },
    {
      stage: 'final_output',
      response: result.finalResponse,
    },
  ];

  return NextResponse.json({
    sessionId,
    stages,
    totalMs: result.totalMs,
    hasErrors: result.hasErrors,
  });
}
