"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session-store";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, clear } = useSessionStore();

  const handleLogout = async () => {
    await clear();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 backdrop-blur-md border-b border-border/50 bg-background/80">
        <div className="mx-auto flex max-w-full items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-md bg-primary/30 border border-border/50 flex items-center justify-center font-semibold text-foreground flex-shrink-0">
              T0
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold truncate">
                Tact0
              </p>
              <p className="text-sm md:text-base font-semibold truncate">Client Interface</p>
            </div>
          </div>

          {/* Desktop Actions - Only show when logged in */}
          {session && (
            <div className="hidden md:flex items-center gap-2">
              {session.email && (
                <span className="text-xs px-2.5 py-1.5 bg-muted/50 text-muted-foreground rounded-md truncate max-w-[150px] lg:max-w-[200px] border border-border/50">
                  {session.email}
                </span>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="sm">
                Logout
              </Button>
            </div>
          )}

          {/* Mobile Actions - Only show when logged in */}
          {session && (
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="sm">
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="w-full h-full">{children}</main>
    </div>
  );
}
