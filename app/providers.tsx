'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/session-store";
import { useThemeStore } from "@/store/theme-store";
import { useLanguageStore } from "@/store/language-store";

function ThemeHydrator() {
  const { theme, hydrate, hydrated } = useThemeStore();

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

function SessionHydrator() {
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}

import { QUERY_CONFIG } from "@/lib/constants";

function LanguageHydrator() {
  const hydrate = useLanguageStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
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
    <QueryClientProvider client={queryClient}>
      <SessionHydrator />
      <ThemeHydrator />
      <LanguageHydrator />
      {children}
    </QueryClientProvider>
  );
}

