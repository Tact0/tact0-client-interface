import { SignJWT, jwtVerify } from "jose";
import { COOKIE_MAX_AGE } from "./constants";
import type { UserRole } from "./schemas";

const AUTH_COOKIE = "tact0_auth";
const JWT_ALGORITHM = "HS256";
const JWT_EXPIRATION = "7d";
const DEFAULT_ROLE: UserRole = "USER";
const AUTH_COOKIE_SECURE =
  process.env.AUTH_COOKIE_SECURE ??
  (process.env.NODE_ENV === "production" ? "true" : "false");

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

interface SessionUser {
  id: string;
  email: string;
  role?: UserRole;
}

interface SessionPayload {
  sub?: string;
  email?: string;
  role?: UserRole;
}

/**
 * Create a JWT session token for a user
 */
export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role || DEFAULT_ROLE,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getSecret());

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySession(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as SessionPayload;
}

/**
 * Get cookie options for authentication
 */
export function authCookieOptions() {
  return {
    name: AUTH_COOKIE,
    options: {
      httpOnly: true,
      secure: AUTH_COOKIE_SECURE !== "false",
      sameSite: "lax" as const,
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    },
  };
}

/**
 * Get the authentication cookie name
 */
export function getAuthCookieName(): string {
  return AUTH_COOKIE;
}
