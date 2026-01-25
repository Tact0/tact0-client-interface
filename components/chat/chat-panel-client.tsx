"use client";

import { useMutation } from "@tanstack/react-query";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { chatWithEngine } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";
import { SquarePen } from "lucide-react";
import { useI18n } from "@/lib/i18n/use-i18n";
import { CookiePreferencesDialog } from "@/components/cookie-preferences-dialog";
import { useChatStore, type ChatState } from "@/store/chat-store";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";

export function ChatPanelClient() {
  const { t } = useI18n();
  const { draft, messages, setDraft, clearDraft, appendMessage } = useChatStore(
    useShallow((state: ChatState) => ({
      draft: state.draft,
      messages: state.messages,
      setDraft: state.setDraft,
      clearDraft: state.clearDraft,
      appendMessage: state.appendMessage,
    }))
  );
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

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollerRef.current?.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const engineRes = await chatWithEngine({ text: content });
      return engineRes;
    },
    onMutate: ({ content }) => {
      appendMessage({
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      });
      clearDraft();
      scrollToBottom();
    },
    onSuccess: (engineRes) => {
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: engineRes.reply,
        createdAt: new Date().toISOString(),
      });
      scrollToBottom();
    },
    onError: (error) => {
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: t("engineErrorReply"),
        createdAt: new Date().toISOString(),
      });
      toast.error(t("engineErrorTitle"), {
        description:
          error instanceof Error ? error.message : t("engineErrorDesc"),
      });
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, mutation.isPending, scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!draft.trim()) return;
    mutation.mutate({ content: draft.trim() });
  }, [draft, mutation]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  return (
    <>
      <HistorySidebar
        history={history}
        showHistory={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {showHistory && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      <div className="flex flex-col flex-1 h-full overflow-hidden bg-card">
        <ChatHeader
          title={t("tact0Session")}
          subtitle={t("chat")}
          onToggleHistory={() => setShowHistory(!showHistory)}
          toggleLabel={t("toggleHistory")}
        />

        <MessageList
          scrollerRef={scrollerRef}
          messages={messages}
          isPending={mutation.isPending}
          emptyText={t("noMessages")}
          waitingLabel={t("waitingForEngine")}
          engineLabel={t("engine")}
          userLabel={t("you")}
        />

        <MessageComposer
          draft={draft}
          onDraftChange={setDraft}
          onClear={clearDraft}
          onSubmit={handleSubmit}
          placeholder={t("askAnything")}
          clearLabel={t("clear")}
          sendLabel={t("send")}
          sendingLabel={t("sending")}
          disabled={mutation.isPending}
          disclaimer={t("reviewDisclaimer")}
        />
      </div>
    </>
  );
}

type HistorySidebarProps = {
  history: Array<{ id: string; title: string }>;
  showHistory: boolean;
  onClose: () => void;
};

const HistorySidebar = memo(function HistorySidebar({
  history,
  showHistory,
  onClose,
}: HistorySidebarProps) {
  const { t } = useI18n();
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[280px] border-r border-border/50 bg-card p-4 space-y-3 overflow-y-auto",
        "fixed md:relative inset-y-0 left-0 z-30",
        showHistory && "flex"
      )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{t("yourChats")}</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
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
  );
});

type ChatHeaderProps = {
  title: string;
  subtitle: string;
  onToggleHistory: () => void;
  toggleLabel: string;
};

const ChatHeader = memo(function ChatHeader({
  title,
  subtitle,
  onToggleHistory,
  toggleLabel,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 px-4 md:px-6 py-3 md:py-4 bg-background/50">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleHistory}
          className="md:hidden"
          aria-label={toggleLabel}>
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
            {subtitle}
          </p>
          <h2 className="text-base md:text-lg font-semibold truncate">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
});

type MessageListProps = {
  scrollerRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  isPending: boolean;
  emptyText: string;
  waitingLabel: string;
  engineLabel: string;
  userLabel: string;
};

const MessageList = memo(function MessageList({
  scrollerRef,
  messages,
  isPending,
  emptyText,
  waitingLabel,
  engineLabel,
  userLabel,
}: MessageListProps) {
  return (
    <div
      ref={scrollerRef}
      className="flex-1 overflow-y-auto space-y-3 px-4 md:px-6 py-4">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg}
          engineLabel={engineLabel}
          userLabel={userLabel}
        />
      ))}
      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
      {isPending && (
        <ChatBubble
          message={{
            id: "pending",
            role: "assistant",
            content: "",
            createdAt: new Date().toISOString(),
          }}
          loading
          waitingLabel={waitingLabel}
          engineLabel={engineLabel}
          userLabel={userLabel}
        />
      )}
    </div>
  );
});

type MessageComposerProps = {
  draft: string;
  onDraftChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  placeholder: string;
  clearLabel: string;
  sendLabel: string;
  sendingLabel: string;
  disabled: boolean;
  disclaimer: string;
};

const MessageComposer = memo(function MessageComposer({
  draft,
  onDraftChange,
  onClear,
  onSubmit,
  placeholder,
  clearLabel,
  sendLabel,
  sendingLabel,
  disabled,
  disclaimer,
}: MessageComposerProps) {
  return (
    <div className="border-t border-border/50 bg-background/50 px-4 md:px-8 lg:px-12 pt-4 md:pt-5 pb-[max(20px,env(safe-area-inset-bottom))] md:pb-6">
      <form className="max-w-3xl mx-auto space-y-4" onSubmit={onSubmit}>
        <div className="relative">
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={2}
            placeholder={placeholder}
            className="min-h-[56px] resize-none py-4 leading-[1.4] placeholder:leading-[1.4]"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] md:text-xs text-muted-foreground/70">
            {disclaimer} <CookiePreferencesDialog />
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="ghost" onClick={onClear} type="button" size="sm">
              {clearLabel}
            </Button>
            <Button type="submit" disabled={disabled} size="sm">
              {disabled ? sendingLabel : sendLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
});

type ChatBubbleProps = {
  message: Message;
  loading?: boolean;
  waitingLabel?: string;
  engineLabel: string;
  userLabel: string;
};

const ChatBubble = memo(function ChatBubble({
  message,
  loading,
  waitingLabel,
  engineLabel,
  userLabel,
}: ChatBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "rounded-lg px-3 md:px-4 py-2.5 md:py-3 w-full md:max-w-[720px]",
        isUser
          ? "md:ml-auto bg-primary/20 text-foreground"
          : "bg-card border border-dark-background/40 dark:border-light-background/40"
      )}>
      <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold">
        {isUser ? userLabel : engineLabel}
      </div>
      <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base wrap-break-words">
        {message.content}
        {loading && (
          <span
            className="inline-flex items-center gap-1 align-middle"
            aria-label={waitingLabel}>
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
          </span>
        )}
      </div>
    </div>
  );
});
