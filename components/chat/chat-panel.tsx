"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { chatWithEngine } from "@/lib/api-client";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";
import { SquarePen } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import { CookiePreferencesDialog } from "@/components/cookie-preferences-dialog";

export function ChatPanel() {
  const { session, hydrated } = useSessionStore();
  const router = useRouter();
  const { t } = useI18n();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const history = useMemo(
    () => [
      { id: "h1", title: `${t("session")} 1` },
      { id: "h2", title: `${t("session")} 2` },
      { id: "h3", title: `${t("session")} 3` },
    ],
    [t]
  );
  const [showHistory, setShowHistory] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [messages]);

  useEffect(() => {
    if (hydrated && !session?.id) {
      router.push(ROUTES.LOGIN);
    }
  }, [hydrated, session?.id, router]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const mutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const engineRes = await chatWithEngine({ text: content });
      return engineRes;
    },
    onSuccess: (engineRes, vars) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: vars.content,
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: engineRes.prompt,
          createdAt: new Date().toISOString(),
        },
      ]);
      setDraft("");
      scrollToBottom();
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, mutation.isPending]);

  // Don't render anything while hydrating or if not authenticated
  // The useEffect handles the redirect to login
  if (!hydrated || !session?.id) {
    return null;
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    mutation.mutate({ content: draft.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
      {/* History Sidebar - Hidden on mobile, visible on desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-[280px] border-r border-border/50 bg-card p-4 space-y-3 overflow-y-auto",
          "fixed md:relative inset-y-0 left-0 z-30",
          showHistory && "flex"
        )}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{t("yourChats")}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(false)}
            className="gap-2">
            <SquarePen className="h-4 w-4" />
            {t("newChat")}
          </Button>
        </div>
        <div className="space-y-2">
          {history.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start h-auto py-2.5">
              <div className="text-left">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {t("engineSession")}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </aside>

      {/* Mobile history overlay */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      <div className="flex flex-col flex-1 h-full overflow-hidden bg-card">
        <div className="flex items-center justify-between border-b border-border/50 px-4 md:px-6 py-3 md:py-4 bg-background/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="md:hidden"
              aria-label={t("toggleHistory")}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground hidden md:block">
                {t("chat")}
              </p>
              <h2 className="text-base md:text-lg font-semibold truncate">
                {t("tact0Session")}
              </h2>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto space-y-3 px-4 md:px-6 py-4">
          {sortedMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {sortedMessages.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("noMessages")}</p>
          )}
          {mutation.isPending && (
            <ChatBubble
              message={{
                id: "pending",
                role: "assistant",
                content: "",
                createdAt: new Date().toISOString(),
              }}
              loading
            />
          )}
        </div>

        <div className="border-t border-border/50 bg-background/50 px-4 md:px-8 lg:px-12 pt-4 md:pt-5 pb-[max(20px,env(safe-area-inset-bottom))] md:pb-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={t("askAnything")}
                className="min-h-[56px] resize-none py-4 leading-[1.4] placeholder:leading-[1.4]"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] md:text-xs text-muted-foreground/70">
                {t("reviewDisclaimer")}{" "}
                <CookiePreferencesDialog />
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setDraft("")}
                  type="button"
                  size="sm">
                  {t("clear")}
                </Button>
                <Button
                  onClick={handleSend}
                  type="button"
                  disabled={mutation.isPending}
                  size="sm">
                  {mutation.isPending ? t("sending") : t("send")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({
  message,
  loading,
}: {
  message: Message;
  loading?: boolean;
}) {
  const isUser = message.role === "user";
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "rounded-lg px-3 md:px-4 py-2.5 md:py-3 w-full md:max-w-[720px]",
        isUser
          ? "md:ml-auto bg-primary/20 text-foreground"
          : "bg-card border border-dark-background/40 dark:border-light-background/40"
      )}>
      <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold">
        {isUser ? t("you") : t("engine")}
      </div>
      <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base wrap-break-words">
        {message.content}
        {loading && (
          <span
            className="inline-flex items-center gap-1 align-middle"
            aria-label={t("waitingForEngine")}>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  );
}
