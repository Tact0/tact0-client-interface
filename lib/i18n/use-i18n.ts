"use client";

import { useCallback, useMemo } from "react";
import { useLanguageStore } from "@/store/language-store";
import { languageOptions, translations, type TranslationKey } from "./translations";

export function useI18n() {
  const { language, setLanguage, hydrated } = useLanguageStore();

  const dictionary = useMemo(() => translations[language] ?? translations.en, [language]);

  const t = useCallback(
    (key: TranslationKey) => dictionary[key] ?? translations.en[key] ?? key,
    [dictionary]
  );

  return {
    language,
    setLanguage,
    hydrated,
    t,
    languages: languageOptions,
  };
}
