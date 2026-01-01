import { SiteShellHeader } from "@/components/layout/site-shell-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh bg-background text-foreground flex flex-col overflow-hidden">
      <SiteShellHeader />
      <main className="w-full flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
