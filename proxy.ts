import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rule: Zero Public Registration surface - /register must return 404
  if (pathname === "/register" || pathname.startsWith("/register/")) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // Session cookie check
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthRoute = pathname === "/login";
  const isOwnerRoute = pathname.startsWith("/owner");
  const isEmployeeRoute = pathname.startsWith("/employee");

  if (!sessionToken && (isOwnerRoute || isEmployeeRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
