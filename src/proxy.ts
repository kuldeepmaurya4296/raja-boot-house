import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const isAuthRoute = ["/login", "/signup", "/register"].includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isCustomerRoute =
    nextUrl.pathname.startsWith("/checkout") || nextUrl.pathname.startsWith("/account");

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin", nextUrl));
      if (role === "vendor") return NextResponse.redirect(new URL("/vendor", nextUrl));
      return NextResponse.redirect(new URL("/account", nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (isCustomerRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    if (role === "vendor") {
      return NextResponse.redirect(new URL("/vendor", nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect root to dashboard based on role if needed? No, public users can see root.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/account/:path*", "/login", "/signup"],
};
