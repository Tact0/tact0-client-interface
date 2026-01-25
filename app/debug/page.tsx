import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import { DebugPanel } from "@/components/debug/debug-panel";
import { SiteShell } from "@/components/layout/site-shell";

export default async function DebugPage() {
  // Server-side route protection - require ADMIN role
  const user = await getCurrentUser();
  if (!user || user.role !== USER_ROLES.ADMIN) {
    redirect(ROUTES.CHAT);
  }

  return (
    <SiteShell>
      <DebugPanel />
    </SiteShell>
  );
}
