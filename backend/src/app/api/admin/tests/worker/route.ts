import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { runDiagnostic } from '@/lib/server/superadmin/workerDiagnostic';
import { logWorkerValidation, logWorkerCorrection } from '@/logging/aiLogger';
import type { DiagnosticRequest } from '@/lib/server/superadmin/workerDiagnosticTypes';
import { getWorkerSchema } from '@/ai/schemas/workerSchemas';

export const runtime = 'nodejs';

function sid(req: NextRequest): string {
  return req.headers.get('x-nutriaid-session-id') || req.cookies.get('na_sid')?.value || 'test-lab';
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const workerId = typeof raw['workerId'] === 'string' ? raw['workerId'].trim() : '';
  if (!workerId) return NextResponse.json({ error: '"workerId" is required.' }, { status: 400 });

  let outputPayload: Record<string, unknown>;
  try {
    outputPayload = typeof raw['output'] === 'string'
      ? (JSON.parse(raw['output'] as string) as Record<string, unknown>)
      : raw['output'] as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: '"output" must be valid JSON.' }, { status: 400 });
  }

  if (!outputPayload || typeof outputPayload !== 'object' || Array.isArray(outputPayload)) {
    return NextResponse.json({ error: '"output" must be a JSON object.' }, { status: 400 });
  }

  const schema = getWorkerSchema(workerId);
  const expectedSchema: Record<string, unknown> = {};
  if (schema) {
    for (const field of schema.required) expectedSchema[field] = 'required';
  }

  const diagRequest: DiagnosticRequest = {
    worker: workerId,
    input: ((raw['input'] as DiagnosticRequest['input']) ?? {}),
    output: outputPayload as DiagnosticRequest['output'],
    expectedSchema,
    intolerances: Array.isArray(raw['intolerances']) ? raw['intolerances'] as string[] : [],
    allergies: Array.isArray(raw['allergies']) ? raw['allergies'] as string[] : [],
    nutritionalGoals: (raw['nutritionalGoals'] as DiagnosticRequest['nutritionalGoals']) ?? undefined,
  };

  const startedAt = Date.now();
  const report = runDiagnostic(diagRequest);
  const executionMs = Date.now() - startedAt;

  const sessionId = sid(request);

  logWorkerValidation(
    workerId,
    report.schema_valid,
    report.logical_valid,
    report.safety_valid,
    { sessionId, userId: auth.session.userId, errors: report.errors },
  );

  if (report.corrected) {
    logWorkerCorrection(
      workerId,
      report.errors,
      outputPayload,
      report.corrected_output,
      { sessionId, userId: auth.session.userId, model: 'rule-based', correctionMs: executionMs },
    );
  }

  return NextResponse.json({
    workerId,
    schemaName: schema?.workerName ?? workerId,
    ...report,
    executionMs,
  });
}
