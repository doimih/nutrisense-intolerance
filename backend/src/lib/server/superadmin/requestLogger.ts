import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logError, logInfo } from '@/lib/server/superadmin/aiLogging';

const SESSION_COOKIE = 'na_sid';

type RouteContext = {
  params: Promise<any>;
};

type RouteHandler = (request: NextRequest, context: RouteContext) => Promise<NextResponse>;

function getSessionId(request: NextRequest): string {
  const fromHeader = request.headers.get('x-nutriaid-session-id');
  if (fromHeader && fromHeader.trim()) return fromHeader.trim();
  const fromCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (fromCookie && fromCookie.trim()) return fromCookie.trim();
  return randomUUID();
}

function getUserId(request: NextRequest): string | null {
  const userId = request.headers.get('x-superadmin-user-id');
  return userId && userId.trim() ? userId.trim() : null;
}

export function withRequestLogging(source: 'system' | 'orchestrator' | 'ai' | 'worker' = 'system') {
  return function wrap(handler: RouteHandler): RouteHandler {
    return async (request: NextRequest, context: RouteContext) => {
      const startedAt = Date.now();
      const sessionId = getSessionId(request);
      const userId = getUserId(request);
      const requestMeta = {
        method: request.method,
        path: request.nextUrl.pathname,
        query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      };

      try {
        const response = await handler(request, context);
        const duration = Date.now() - startedAt;

        logInfo({
          sessionId,
          userId,
          source,
          metadata: {
            message: 'request/response',
            request: requestMeta,
            response: {
              status: response.status,
            },
            executionMs: duration,
          },
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startedAt;
        logError({
          sessionId,
          userId,
          source,
          error: error instanceof Error ? { message: error.message, stack: error.stack || null } : { message: String(error) },
          metadata: {
            message: 'request failed',
            request: requestMeta,
            executionMs: duration,
          },
        });

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    };
  };
}
