"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginRequest } from "@/lib/api-client";
import { useSessionStore } from "@/store/session-store";
import { authSchema } from "@/lib/schemas";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BorderBeam } from "@/components/border-beam";
import { CheckCircle2, Github, Linkedin, MessageCircle, Heart } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/use-i18n";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const { t } = useI18n();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession({
        email: data.user?.email,
        id: data.user?.id,
        role: data.user?.role,
      });
      toast.success(t("loginSuccess"), {
        description: t("loginSuccessDesc"),
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        action: {
          label: t("toastUndo"),
          onClick: () => console.log("Undo"),
        },
      });
      router.push(ROUTES.CHAT);
    },
    onError: (err) => {
      const message =
        err instanceof Error ? err.message : t("unableToSignIn");
      setErrors(message);
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors(null);
    const parsed = authSchema.safeParse(formState);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      setErrors(
        firstError?.message ||
          t("invalidCredentials")
      );
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <Card className="max-w-lg w-full relative overflow-hidden border border-border/80">
      <BorderBeam
        size={200}
        duration={10}
        colorFrom="#2BCC96"
        colorTo="#2BCC96"
        borderWidth={3}
      />
      <CardHeader className="p-4 sm:p-6">
        <div className="space-y-2">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">
            {t("loginTitle")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t("loginDescription")}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder={t("emailPlaceholder")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={formState.password}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={t("passwordPlaceholder")}
              required
            />
          </div>

          {errors && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/40 rounded-md px-3 py-2">
              {errors}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}>
            {mutation.isPending ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </CardContent>

      {/* Footer with icons and copyright */}
      <div className="w-full px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-xs sm:text-sm text-muted-foreground border-t border-border/20 pt-4 mt-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors">
            <Github className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors">
            <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <Link
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors">
            <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div className="flex items-center gap-1.5 ml-1">
            <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-pink-500 fill-pink-500" />
            <span className="text-foreground text-xs">{t("communityStat")}</span>
          </div>
        </div>
        <div className="text-muted-foreground text-center sm:text-right whitespace-nowrap">
          {t("copyright")}
        </div>
      </div>
    </Card>
  );
}







