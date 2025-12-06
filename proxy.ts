import { createServerSupabaseClient } from '@/lib/supabase-server'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    const { pathname } = request.nextUrl
    
    // Allow access to public routes
    if (pathname === '/' || pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    
    // Redirect authenticated users away from auth pages
    if (pathname === '/' && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Protect authenticated routes
    const protectedRoutes = ['/dashboard', '/expenses', '/budget', '/analytics', '/needs']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    return NextResponse.next()
  } catch (error) {
    // If there's an error with Supabase, allow the request to continue
    // The client-side auth will handle the redirect
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}