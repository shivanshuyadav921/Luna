import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

// Protected app routes — unauthenticated users are redirected to /login
const PROTECTED_PATHS = [
  '/home',
  '/discover',
  '/connections',
  '/messages',
  '/notifications',
  '/settings',
  '/cats',
  '/posts',
  '/onboarding',
];

// Auth-only routes — logged-in users are redirected to /home
const AUTH_PATHS = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from auth pages
  if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const redirectResponse = NextResponse.redirect(new URL('/home', request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Redirect unauthenticated users away from protected app pages
  if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
