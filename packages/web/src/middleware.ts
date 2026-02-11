import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname

  // Define public routes that don't need authentication
  const publicRoutes = ['/login', '/api']
  
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // If it's a public route, allow the request
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for session token in cookies
  const sessionToken = request.cookies.get('session_token')?.value
  
  // If no session token and not on login page, redirect to login
  if (!sessionToken && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (sessionToken && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}