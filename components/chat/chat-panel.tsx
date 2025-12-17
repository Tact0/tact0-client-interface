'use client';

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { chatWithEngine } from "@/lib/api-client";
import { useSessionStore } from "@/store/session-store";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { Message } from "@/lib/types";

export function ChatPanel() {
  const { session, hydrated } = useSessionStore();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history] = useState([
    { id: "h1", title: "Session 1" },
    { id: "h2", title: "Session 2" },
    { id: "h3", title: "Session 3" },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hydrated && !session?.id) {
      router.push(ROUTES.LOGIN);
    }
  }, [hydrated, session?.id, router]);

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
      requestAnimationFrame(() => {
        scrollerRef.current?.scrollTo({
          top: scrollerRef.current.scrollHeight,
          behavior: "smooth",
        });
      });
    },
  });

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [messages]);

  if (!hydrated) {
    return (
      <Card className="p-8">
        <p className="text-sm text-muted-foreground">Loading session…</p>
      </Card>
    );
  }

  if (!session?.id) {
    return (
      <Card className="p-8">
        <p className="text-sm text-muted-foreground">
          You are not authenticated. Redirecting to login…
        </p>
      </Card>
    );
  }

  const handleSend = () => {
    if (!draft.trim()) return;
    mutation.mutate({ content: draft.trim() });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-80px)]">
      {/* History Sidebar - Hidden on mobile, visible on desktop */}
      <aside className={cn(
        "hidden md:flex flex-col w-[280px] border-r border-border/50 bg-card p-4 space-y-3 overflow-y-auto",
        "fixed md:relative inset-y-0 left-0 z-30",
        showHistory && "flex"
      )}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">History</p>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(false)}
          >
            New chat
          </Button>
        </div>
        <div className="space-y-2">
          {history.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start h-auto py-2.5"
            >
              <div className="text-left">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">Engine session</p>
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
              aria-label="Toggle history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground hidden md:block">
                Chat
              </p>
              <h2 className="text-base md:text-lg font-semibold truncate">Tact0 Session</h2>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            {session.email && (
              <span className="text-xs px-2.5 py-1.5 bg-muted/50 text-muted-foreground rounded-md truncate max-w-[200px] border border-border/50">
                {session.email}
              </span>
            )}
            <span className="text-xs px-2.5 py-1.5 bg-muted/50 text-muted-foreground rounded-md hidden lg:inline border border-border/50">
              API: {process.env.NEXT_PUBLIC_ENGINE_URL ?? "Not set"}
            </span>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto space-y-3 px-4 md:px-6 py-4"
        >
          {sortedMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {sortedMessages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation below.
            </p>
          )}
          {mutation.isPending && (
            <p className="text-sm text-muted-foreground">Waiting for engine…</p>
          )}
        </div>

        <div className="border-t border-border/50 bg-background/50 px-4 md:px-6 py-3 md:py-4 space-y-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Type a message to the engine..."
          />
          <div className="flex items-center gap-2 md:gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setDraft("")}
              type="button"
            >
              Clear
            </Button>
            <Button
              onClick={handleSend}
              type="button"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending…" : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "rounded-lg px-3 md:px-4 py-2.5 md:py-3 w-full md:max-w-[720px]",
        isUser
          ? "md:ml-auto bg-primary/20 text-foreground"
          : "bg-card border border-border/50"
      )}
    >
      <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold">
        {isUser ? "You" : "Engine"}
      </div>
      <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base break-words">{message.content}</div>
    </div>
  );
}

