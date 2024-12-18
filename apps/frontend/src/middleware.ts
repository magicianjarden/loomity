import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
]

// Define auth routes that should redirect to dashboard if user is already logged in
const authRoutes = [
  '/auth',
  '/login',
  '/signup',
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if possible
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  console.log('Middleware - Current path:', path);
  console.log('Middleware - Session exists:', !!session);

  // Check if we're on a dashboard route
  const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth');

  // If user is not signed in and trying to access dashboard
  if (!session && isDashboardRoute) {
    console.log('Middleware - No session, redirecting to auth');
    // Store the original URL to redirect back after login
    const redirectUrl = new URL('/auth', req.url)
    redirectUrl.searchParams.set('returnUrl', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and trying to access auth page
  if (session && isAuthRoute) {
    console.log('Middleware - Has session, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

// Update matcher to exclude api routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
