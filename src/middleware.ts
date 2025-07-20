import { stackServerApp } from "@/lib/stack";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  '/dashboard',
  '/profile',
  // Note: /project routes are handled individually in the page component
  // to allow public project viewing
];

export default async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  
  // Handle redirect after sign-in
  if (request.nextUrl.pathname === "/dashboard" && user) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    if (redirectParam) {
      // Clear the redirect param and redirect to the intended destination
      return NextResponse.redirect(new URL(redirectParam, request.url));
    }
  }
  
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};