import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Handle protected routes
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Handle auth routes - redirect to dashboard if already logged in
    if (session && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

// Update config to also protect auth routes
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}
