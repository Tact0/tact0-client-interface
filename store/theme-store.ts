"use client";

import { create } from "zustand";

type Theme = "dark" | "light";

export type ThemeState = {
  theme: Theme;
  hydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrate: () => void;
};

const THEME_KEY = "tact0-theme";

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  hydrated: false,
  setTheme: (theme) => {
    set({ theme, hydrated: true });
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, theme);
    }
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const theme = stored ?? "dark";
    set({ theme, hydrated: true });
  },
}));
