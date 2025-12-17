import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authCookieOptions, createSession } from "@/lib/auth";
import { authSchema } from "@/lib/schemas";
import { AUTH_ERRORS } from "@/lib/constants";

const BCRYPT_ROUNDS = 10;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = authSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: AUTH_ERRORS.INVALID_INPUT }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: AUTH_ERRORS.USER_EXISTS }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const token = await createSession({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    const { name, options } = authCookieOptions();

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
    response.cookies.set(name, token, options);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: AUTH_ERRORS.INVALID_INPUT }, { status: 500 });
  }
}
