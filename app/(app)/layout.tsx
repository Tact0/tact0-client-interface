import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { ROUTES } from "@/lib/constants";
import { AppProviders } from "@/components/providers/providers";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <AppProviders
      initialSession={{
        id: user.id,
        email: user.email,
        role: user.role,
      }}>
      {children}
    </AppProviders>
  );
}
