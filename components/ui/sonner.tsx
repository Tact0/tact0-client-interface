"use client";

import * as React from "react";
import { Toaster as Sonner } from "sonner";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/theme-store";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ className, ...props }: ToasterProps) {
  const theme = useThemeStore((s) => s.theme);
  const sonnerTheme = theme === "dark" ? "light" : "dark";

  return (
    <Sonner
      position="top-center"
      theme={sonnerTheme}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-foreground group-[.toaster]:text-background group-[.toaster]:border-foreground/20 group-[.toaster]:shadow-lg data-[type=success]:border-emerald-400/60 data-[type=success]:bg-emerald-400/15 data-[type=info]:border-sky-400/60 data-[type=info]:bg-sky-400/15 data-[type=warning]:border-amber-400/60 data-[type=warning]:bg-amber-400/15 data-[type=error]:border-rose-400/60 data-[type=error]:bg-rose-400/15",
          description: "group-[.toast]:text-background/70",
          actionButton:
            "group-[.toast]:bg-background group-[.toast]:text-foreground",
          cancelButton:
            "group-[.toast]:bg-background/80 group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  );
}
