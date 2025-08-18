import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/api/me"];

export default auth((req) => {
  const { nextUrl } = req;
  if (PROTECTED.some((p) => nextUrl.pathname.startsWith(p))) {
    if (!req.auth?.user) {
      const url = new URL("/auth/signin", nextUrl.origin);
      url.searchParams.set("callbackUrl", nextUrl.href);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/me"],
};
