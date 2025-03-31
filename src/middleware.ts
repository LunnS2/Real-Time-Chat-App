import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}

{/*import { clerkMiddleware } from '@clerk/nextjs/server'

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


import { clerkMiddleware } from "@clerk/nextjs/server";

// Middleware function to protect all routes, including "/"
export default clerkMiddleware(async (auth) => {
  await auth.protect(); // Protect all routes
});

// Configuration for the middleware
export const config = {
  matcher: [
    // Match all paths including "/" while skipping Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
*/}