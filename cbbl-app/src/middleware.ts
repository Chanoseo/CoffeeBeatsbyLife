export { auth as default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/reservations/:path*",
    "/api/queue/:path*",
    "/api/preorders/:path*",
    "/api/feedback/:path*"
    
  ]
};
