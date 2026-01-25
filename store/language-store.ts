"use client";

import { create } from "zustand";
import type { Language } from "@/lib/i18n/translations";

export type LanguageState = {
  language: Language;
  hydrated: boolean;
  setLanguage: (language: Language) => void;
  hydrate: () => void;
};

const LANGUAGE_KEY = "tact0-language";

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  hydrated: false,
  setLanguage: (language) => {
    set({ language, hydrated: true });
    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    set({ language: stored ?? "en", hydrated: true });
  },
}));
