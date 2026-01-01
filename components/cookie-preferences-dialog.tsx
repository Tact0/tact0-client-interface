"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useI18n } from "@/lib/i18n/use-i18n";

type CookieRowProps = {
  title: string;
  description: string;
  active: boolean;
  locked?: boolean;
};

function CookieRow({ title, description, active, locked }: CookieRowProps) {
  const { t } = useI18n();
  return (
    <div className="border-t border-border/60 py-5">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div
          aria-hidden="true"
          className={`relative h-6 w-11 rounded-full border border-border/60 transition ${
            active ? "bg-primary/70" : "bg-muted/50"
          }`}>
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition ${
              active ? "right-0.5" : "left-0.5"
            }`}
          />
        </div>
      </div>
      {locked && (
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {t("cookieAlwaysActive")}
        </p>
      )}
    </div>
  );
}

export function CookiePreferencesDialog() {
  const { t } = useI18n();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="underline hover:text-muted-foreground transition-colors">
          {t("cookiePreferences")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl border-border/60 bg-background/95 text-foreground backdrop-blur">
        <AlertDialogHeader className="space-y-0 text-left">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-lg font-semibold">
              {t("cookieTitle")}
            </AlertDialogTitle>
            <AlertDialogCancel asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("close")}
                className="-mr-2">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>
        <div className="space-y-4 pt-4 text-sm text-muted-foreground">
          <p>{t("cookieIntro")}</p>
          <a className="underline" href="#" rel="noreferrer">
            {t("learnMore")}
          </a>
        </div>
        <div className="pt-2">
          <CookieRow
            title={t("cookieStrictTitle")}
            description={t("cookieStrictDesc")}
            active
            locked
          />
          <CookieRow
            title={t("cookieAnalyticsTitle")}
            description={t("cookieAnalyticsDesc")}
            active={false}
          />
          <CookieRow
            title={t("cookieMarketingTitle")}
            description={t("cookieMarketingDesc")}
            active={false}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
