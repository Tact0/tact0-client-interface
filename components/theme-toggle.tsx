"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";

export function ThemeToggle() {
  const { theme, toggleTheme, hydrated, hydrate } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
      disabled={!hydrated && !mounted}>
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
