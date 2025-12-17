import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./server-auth";
import { ROUTES } from "./constants";
import type { UserRole } from "./schemas";

/**
 * Require authentication for a route
 * Returns user and redirect response if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return { user: null, redirect: NextResponse.redirect(url) };
  }
  return { user, redirect: null };
}

/**
 * Require specific role(s) for a route
 * Returns user and redirect response if not authorized
 */
export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const { user, redirect } = await requireAuth(request);
  if (redirect) return { user: null, redirect };

  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.CHAT;
    return { user: null, redirect: NextResponse.redirect(url) };
  }

  return { user, redirect: null };
}

