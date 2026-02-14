import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Admin credentials from environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@myhomepromotions.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Security headers for all responses
  const response = NextResponse.next()
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;")
  
  // Public paths that don't need auth
  const publicPaths = [
    '/login', 
    '/api/auth/login', 
    '/api/auth/logout', 
    '/api/telnyx/webhook',
    '/api/telnyx/test',
    '/api/twilio/webhook',
    '/api/webhook',
    '/api/admin/migrate',  // Schema migration
    '/api/health',
    '/api/debug/reset'
  ]
  
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))

  // Static assets
  const isStaticAsset = pathname.startsWith('/_next/') || 
                        pathname.startsWith('/static/') || 
                        pathname === '/favicon.ico'

  if (isPublicPath || isStaticAsset) {
    return response
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth-token')
  
  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
