import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register", "/"];

// Role-based route protection
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/users", "/admin"],
  DIETITIAN: ["/dashboard", "/clients", "/diet-plans", "/meals", "/foods"],
  CLIENT: ["/dashboard"],
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is public
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Get auth token and user role from request headers
  // (set by auth flow in the client)
  const token = request.cookies.get("accessToken")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // No token - redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Token exists but check role-based access
  if (userRole && ROLE_ROUTES[userRole]) {
    const allowedRoutes = ROLE_ROUTES[userRole];
    
    // Check if current path is allowed for this role
    const isAllowed = allowedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!isAllowed) {
      // Redirect to dashboard or home based on role
      const redirectUrl =
        userRole === "ADMIN"
          ? "/users"
          : userRole === "DIETITIAN"
            ? "/dashboard"
            : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    "/((?!_next|api|.*\\..*|favicon.ico).*)",
  ],
};
