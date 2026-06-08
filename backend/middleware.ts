import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'na_sid';

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value || crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nutriaid-session-id', sessionId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
