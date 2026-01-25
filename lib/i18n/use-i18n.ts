"use client";

import { useCallback, useMemo } from "react";
import { useLanguageStore, type LanguageState } from "@/store/language-store";
import { useShallow } from "zustand/shallow";
import { languageOptions, translations, type TranslationKey } from "./translations";

export function useI18n() {
  const { language, setLanguage, hydrated } = useLanguageStore(
    useShallow((state: LanguageState) => ({
      language: state.language,
      setLanguage: state.setLanguage,
      hydrated: state.hydrated,
    }))
  );

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
