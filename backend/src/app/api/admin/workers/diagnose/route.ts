import { NextRequest, NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/server/superadmin/rbac';
import { runDiagnostic } from '@/lib/server/superadmin/workerDiagnostic';
import { logWorkerEvent } from '@/lib/server/superadmin/aiLogging';
import type { DiagnosticRequest } from '@/lib/server/superadmin/workerDiagnosticTypes';

export const runtime = 'nodejs';

function getSessionId(request: NextRequest): string {
  return (
    request.headers.get('x-nutriaid-session-id') ||
    request.cookies.get('na_sid')?.value ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperadmin(request);
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be a JSON object.' }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw['worker'] !== 'string' || !raw['worker'].trim()) {
    return NextResponse.json({ error: '"worker" (string) is required.' }, { status: 400 });
  }

  if (typeof raw['output'] !== 'object' || raw['output'] === null || Array.isArray(raw['output'])) {
    return NextResponse.json({ error: '"output" (object) is required.' }, { status: 400 });
  }

  const diagnosticRequest: DiagnosticRequest = {
    worker: String(raw['worker']).trim(),
    input: (raw['input'] as DiagnosticRequest['input']) ?? {},
    output: raw['output'] as DiagnosticRequest['output'],
    expectedSchema: (raw['expectedSchema'] as DiagnosticRequest['expectedSchema']) ?? {},
    userProfile: (raw['userProfile'] as DiagnosticRequest['userProfile']) ?? {},
    intolerances: Array.isArray(raw['intolerances'])
      ? (raw['intolerances'] as string[]).filter((i) => typeof i === 'string')
      : [],
    allergies: Array.isArray(raw['allergies'])
      ? (raw['allergies'] as string[]).filter((a) => typeof a === 'string')
      : [],
    nutritionalGoals:
      typeof raw['nutritionalGoals'] === 'object' && raw['nutritionalGoals'] !== null
        ? (raw['nutritionalGoals'] as DiagnosticRequest['nutritionalGoals'])
        : undefined,
  };

  const report = runDiagnostic(diagnosticRequest);

  // Log to AI_Logs store
  const sessionId = getSessionId(request);
  logWorkerEvent({
    sessionId,
    userId: auth.session.userId,
    worker: diagnosticRequest.worker,
    status: report.corrected ? 'warning' : 'success',
    executionMs: report.diagnosticMs,
    inputSchema: diagnosticRequest.input,
    outputSchema: report.corrected_output,
    validationErrors: report.errors,
    safetyFlags: report.errors.filter((e) => e.includes('safety') || e.includes('allergen') || e.includes('intolerance') || e.includes('Safety')),
    metadata: {
      schema_valid: report.schema_valid,
      logical_valid: report.logical_valid,
      safety_valid: report.safety_valid,
      corrected: report.corrected,
    },
  });

  return NextResponse.json(report);
}
