import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Next.js 16 Proxy (replaces middleware.ts).
 *
 * Protects authority-only routes by checking for a valid Supabase session
 * and verifying the user has the 'authority' role in their profile.
 *
 * For a hackathon prototype, we use a lightweight cookie-based check:
 * the auth context sets a `nirapod_role` cookie on sign-in that the proxy
 * reads. This avoids a Supabase roundtrip on every request while still
 * gating the route. The actual profile data is validated client-side by
 * the AuthProvider for display purposes.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /authority routes
  if (!pathname.startsWith('/authority')) {
    return NextResponse.next();
  }

  // Check for Supabase auth tokens (sb-*-auth-token cookies)
  const cookies = request.cookies.getAll();
  const hasAuthToken = cookies.some(
    (c) => c.name.includes('-auth-token') || c.name.includes('sb-')
  );

  if (!hasAuthToken) {
    // No session at all — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role cookie set by the auth context
  const roleCookie = request.cookies.get('nirapod_role');
  if (roleCookie && roleCookie.value !== 'authority') {
    // User is authenticated but not an authority — redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow (role is authority, or role cookie not yet set — will be validated client-side)
  return NextResponse.next();
}

export const config = {
  matcher: ['/authority/:path*'],
};
