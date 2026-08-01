import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Public routes that do NOT require authentication.
 * Every other route is protected and will redirect
 * unauthenticated visitors back to the landing page ("/").
 */
const isPublicRoute = createRouteMatcher([
  "/",                    // Landing page
  "/sign-in(.*)",         // Clerk sign-in (modal fallback)
  "/sign-up(.*)",         // Clerk sign-up (modal fallback)
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth();

    if (!userId) {
      // Redirect unauthenticated users to the landing page
      const landingUrl = new URL("/", request.url);
      // Preserve the intended destination so the landing page CTAs can use it
      landingUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
      return NextResponse.redirect(landingUrl);
    }
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)).*)",
  ],
};
