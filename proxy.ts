import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAuth } from "./lib/route-protection";
import { ROUTES } from "./lib/constants";

/**
 * Middleware to protect routes requiring authentication
 */
export default async function proxy(req: NextRequest) {
  const isProtected = req.nextUrl.pathname.startsWith(ROUTES.CHAT);
  if (!isProtected) return NextResponse.next();

  const { redirect } = await requireAuth(req);
  if (redirect) return redirect;

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/chat"],
};
