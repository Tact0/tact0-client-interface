import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { ROUTES } from "@/lib/constants";
import { LoginScreen } from "@/components/auth/login-screen";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect(ROUTES.CHAT);
  }
  return <LoginScreen />;
}
