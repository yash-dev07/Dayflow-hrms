import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth'

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith('/api/auth/'))) {
    return NextResponse.next()
  }

  const session = getTokenFromRequest(request)
  
  // Redirect to login if no session
  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protect admin routes - only ADMIN and HR can access
  if (pathname.startsWith('/admin')) {
    if (!['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.redirect(new URL('/employee/dashboard', request.url))
    }
  }

  // Protect employee routes - only EMPLOYEE can access (admins go to /admin)
  if (pathname.startsWith('/employee')) {
    if (['ADMIN', 'HR'].includes(session.role)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
