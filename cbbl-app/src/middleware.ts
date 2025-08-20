import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Only protect /home and /dashboard routes
  if (!path.startsWith("/home") && !path.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Get JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If not logged in → redirect to sign-in page
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = (token.role ?? "user").toLowerCase();

  // Admin pages: only admins allowed
  if (path.startsWith("/dashboard")) {
    if (role !== "admin") {
      // Normal users trying to access admin page → 404
      return NextResponse.redirect(new URL("/404", req.url));
    }
    return NextResponse.next(); // Admin allowed
  }

  // User pages: only non-admins allowed
  if (path.startsWith("/home")) {
    if (role === "admin") {
      // Admin trying to access user page → redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next(); // User allowed
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/home/:path*", "/dashboard", "/dashboard/:path*"],
};
