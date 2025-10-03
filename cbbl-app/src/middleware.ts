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
    "/messages",
    "/user",
    "/cms",
  ];
  const staffRoutes = ["/orders", "/seats", "/customers"];
  const userRoutes = ["/home", "/profile"];
  const walkinRoutes = ["/walk-ins"];

  // Skip routes that are not protected
  if (
    !adminRoutes.some((r) => path.startsWith(r)) &&
    !staffRoutes.some((r) => path.startsWith(r)) &&
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

  // Staff routes: staff + admin allowed
  if (staffRoutes.some((r) => path.startsWith(r))) {
    if (role === "admin" || role === "staff") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/404", req.url));
  }

  // User routes: only non-admins allowed
  if (userRoutes.some((r) => path.startsWith(r))) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (role === "walkin") {
      return NextResponse.redirect(new URL("/walk-ins", req.url));
    }
    if (role === "staff") {
      return NextResponse.redirect(new URL("/orders", req.url));
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
    "/profile",
    "/profile/:path*",
    "/walk-ins",
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
    "/user",
    "/user/:path*",
    "/cms",
    "/cms/:path*",
    "/customers",
    "/customers/:path*",
  ],
};
