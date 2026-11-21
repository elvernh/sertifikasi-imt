// Middleware (Next.js 16 calls this file "proxy"). It runs before every /admin and
// /tenant page and checks the login cookie, so the pages don't have to.
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const session = await getSession();

  // 1. Admin pages are only for admins
  if (path.startsWith("/admin") && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Tenant pages are only for tenants
  if (path.startsWith("/tenant") && session?.role !== "TENANT") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Allowed: continue to the page
  return NextResponse.next();
}

// The middleware only runs for these pages.
export const config = {
  matcher: ["/admin/:path*", "/tenant/:path*"],
};
