"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useThemeStore, type ThemeState } from "@/store/theme-store";
import { useLanguageStore } from "@/store/language-store";
import { useSessionStore } from "@/store/auth-store";
import { QUERY_CONFIG } from "@/lib/constants";
import type { Session } from "@/lib/types";
import { useShallow } from "zustand/shallow";

function ThemeHydrator() {
  const { hydrate, theme, hydrated } = useThemeStore(
    useShallow((state: ThemeState) => ({
      hydrate: state.hydrate,
      theme: state.theme,
      hydrated: state.hydrated,
    }))
  );

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof document === "undefined" || !hydrated) return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.setProperty("color-scheme", theme);
  }, [theme, hydrated]);

  return null;
}

function LanguageHydrator() {
  const hydrate = useLanguageStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}

function SessionHydrator({
  initialSession,
}: {
  initialSession?: Session | null;
}) {
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate(initialSession ?? undefined);
  }, [hydrate, initialSession]);

  return null;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: QUERY_CONFIG.RETRY,
            refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
            staleTime: QUERY_CONFIG.STALE_TIME,
          },
          mutations: {
            retry: QUERY_CONFIG.RETRY,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeHydrator />
      <LanguageHydrator />
      {children}
    </>
  );
}

export function AppProviders({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession?: Session | null;
}) {
  return (
    <QueryProvider>
      <SessionHydrator initialSession={initialSession} />
      <ThemeHydrator />
      <LanguageHydrator />
      {children}
    </QueryProvider>
  );
}
