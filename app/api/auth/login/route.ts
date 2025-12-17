import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authCookieOptions, createSession } from "@/lib/auth";
import { authSchema } from "@/lib/schemas";
import { AUTH_ERRORS } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = authSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_CREDENTIALS }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_CREDENTIALS }, { status: 401 });
    }

    const token = await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const { name, options } = authCookieOptions();

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
    response.cookies.set(name, token, options);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: AUTH_ERRORS.INVALID_CREDENTIALS }, { status: 500 });
  }
}
