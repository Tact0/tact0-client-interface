"use client";

import { useRouter } from "next/navigation";
import { useSessionStore, type AuthState } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { ROUTES } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/lib/i18n/use-i18n";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useShallow } from "zustand/shallow";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SiteShellHeader() {
  const router = useRouter();
  const { session, logout } = useSessionStore(
    useShallow((state: AuthState) => ({
      session: state.session,
      logout: state.logout,
    }))
  );
  const resetChat = useChatStore((state) => state.reset);
  const { t } = useI18n();

  const handleLogout = () => {
    resetChat();
    void logout();
    toast.success(t("logoutSuccess"), {
      description: t("logoutSuccessDesc"),
      icon: <LogOut className="h-4 w-4 text-emerald-500" />,
    });
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="shrink-0 z-20 backdrop-blur-md border-b border-border/50 bg-background/80">
      <div className="mx-auto flex max-w-full items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-md bg-primary/30 border border-border/50 flex items-center justify-center font-semibold text-foreground flex-shrink-0">
            T0
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-xs md:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold truncate">
              {t("appName")}
            </p>
            <p className="text-sm md:text-base font-semibold truncate">
              {t("appSubtitle")}
            </p>
          </div>
        </div>

        {session && (
          <div className="hidden md:flex items-center gap-2">
            {session.email && (
              <span className="relative text-xs px-2.5 py-1.5 bg-muted/50 text-muted-foreground rounded-md truncate max-w-[150px] lg:max-w-[200px] border border-border/50 overflow-hidden">
                {session.email}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-1/2 border-t-2 border-r-2 border-b-2 border-[#2BCC96] rounded-r-md"
                />
              </span>
            )}
            <LanguageSelector />
            <ThemeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("logout")}
                  title={t("logout")}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("logoutConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("logoutConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    {t("continue")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {session && (
          <div className="md:hidden flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("logout")}
                  title={t("logout")}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("logoutConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("logoutConfirmDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    {t("continue")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </header>
  );
}
