import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Routes that are protected
  const adminRoutes = [
    "/dashboard",
    "/products",
    "/orders",
    "/messages",
    "/seats",
    "/user", // ✅ added user under admin
  ];
  const userRoutes = ["/home"];
  const walkinRoutes = ["/walk-ins"]; // ✅ walk-in routes

  // Skip routes that are not protected
  if (
    !adminRoutes.some((r) => path.startsWith(r)) &&
    !userRoutes.some((r) => path.startsWith(r)) &&
    !walkinRoutes.some((r) => path.startsWith(r))
  ) {
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
      return NextResponse.redirect(new URL("/404", req.url));
    }
    return NextResponse.next();
  }

  // User routes: only non-admins allowed
  if (userRoutes.some((r) => path.startsWith(r))) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (role === "walkin") {
      return NextResponse.redirect(new URL("/walk-ins", req.url)); // ✅ walkin → walk-ins
    }
    return NextResponse.next();
  }

  // Walk-in routes: only walkin allowed
  if (walkinRoutes.some((r) => path.startsWith(r))) {
    if (role !== "walkin") {
      return NextResponse.redirect(new URL("/404", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/walk-ins", // ✅ walk-in
    "/walk-ins/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/products",
    "/products/:path*",
    "/orders",
    "/orders/:path*",
    "/messages",
    "/messages/:path*",
    "/seats",
    "/seats/:path*",
    "/user", // ✅ added user
    "/user/:path*", // ✅ added user
  ],
};
