import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  const email = "admin@tact0.com";
  const password = "ChangeMeStrong!";
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash, role: "ADMIN" },
  });
  console.log("Admin user:", user.email);
}
main().finally(() => prisma.$disconnect());
