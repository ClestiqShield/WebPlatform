import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('clestiq_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/signup'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Auth paths
  const isAuthPath = pathname.startsWith('/auth');

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add debug headers to see if middleware is working
  const response = NextResponse.next();
  response.headers.set('X-Has-Token', token ? 'yes' : 'no');
  response.headers.set('X-Requested-Path', pathname);
  response.headers.set('X-Middleware-Ran', 'true');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except _next internals and static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
