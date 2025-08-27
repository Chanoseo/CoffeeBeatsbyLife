import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Routes that are protected
  const adminRoutes = ["/dashboard", "/products", "/orders", "/messages"];
  const userRoutes = ["/home"];

  // Skip routes that are not protected
  if (!adminRoutes.some((r) => path.startsWith(r)) && !userRoutes.some((r) => path.startsWith(r))) {
    return NextResponse.next();
  }

  // Get JWT token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not logged in → redirect to sign-in page
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = (token.role ?? "user").toLowerCase();

  // Admin routes: only admin allowed
  if (adminRoutes.some((r) => path.startsWith(r))) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/404", req.url)); // normal users → 404
    }
    return NextResponse.next(); // admin allowed
  }

  // User routes: only non-admins allowed
  if (userRoutes.some((r) => path.startsWith(r))) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url)); // admin → dashboard
    }
    return NextResponse.next(); // user allowed
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/products",
    "/products/:path*",
    "/orders",
    "/orders/:path*",
    "/messages",
    "/messages/:path*",
  ],
};
