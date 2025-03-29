import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  // Public routes
  const publicPaths = ['/sign-in', '/sign-up']
  
  // Skip auth for public routes
  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return
  }

  // Get auth state
  const { userId } = await auth()

  // Redirect unauthenticated users
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return Response.redirect(signInUrl)
  }
})

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|.*\\..*).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}