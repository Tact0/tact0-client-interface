import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server-auth";
import { AUTH_ERRORS } from "@/lib/constants";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 500 });
  }
}
