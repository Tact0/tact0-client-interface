import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getAuthCookieName, verifySession } from "./auth";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) {
    return null;
  }
  try {
    const payload = await verifySession(token);
    if (!payload.sub) {
      return null;
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user;
  } catch {
    return null;
  }
}
