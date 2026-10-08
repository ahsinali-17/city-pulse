import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = nextUrl.pathname === "/";
  const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

  // Let NextAuth handle its own API routes
  if (isApiAuthRoute) return; 

  // Redirect authenticated users away from Auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === "CITIZEN") return Response.redirect(new URL("/citizen/new", nextUrl));
      if (role === "FIELD_WORKER") return Response.redirect(new URL("/field", nextUrl));
      if (role === "MANAGER" || role === "ADMIN") return Response.redirect(new URL("/manager/map", nextUrl));
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  // Enforce Authentication on private routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  // Role-Based Access Control (RBAC)
  if (isLoggedIn) {
    const isManagerRoute = nextUrl.pathname.startsWith("/manager");
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");
    const isFieldRoute = nextUrl.pathname.startsWith("/field");

    if (isManagerRoute && role !== "MANAGER" && role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
    
    if (isAdminRoute && role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
    
    if (isFieldRoute && role !== "FIELD_WORKER" && role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
  }
});

// Configure which paths invoke the middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png|.*\\.jpg).*)"],
};
