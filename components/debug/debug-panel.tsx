"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { debugChatWithEngine } from "@/lib/api-client";
import { ROUTES } from "@/lib/constants";
import type { DebugChatResponse } from "@/lib/schemas";
import "../../app/(app)/debug/debug.css";

const METRICS_KEYS = ["alive", "control", "contact", "warmth"];
const SIGNALS_KEYS = ["pauseSignal", "contactSignal", "depthSignal", "asymmetrySignal", "scaleLevel", "scaleJump"];
const VNP_SIGNAL_KEYS = [
  "role_signal",
  "addressee_signal",
  "time_signal",
  "scale_position_signal",
  "inner_source_signal",
  "commitment_signal",
  "perspective_stability",
];
const VNP_CATEGORICAL_KEYS = ["dominant_role", "dominant_addressee", "time_frame", "scale_position"];
const VNP_EVENT_KEYS = [
  "role_loss_event",
  "addressless_event",
  "time_collapse_event",
  "commitment_drop_event",
  "perspective_blur_event",
];

const MODES = ["pause", "mirror", "guard", "play", "storm"];

interface Message {
  author: string;
  text: string;
  variant: "user" | "engine";
}

interface DebugState {
  metrics: Record<string, number>;
  signals: Record<string, number | boolean>;
  anchors: Record<string, number | string>;
  vnpEvents: Record<string, boolean>;
  warnings: string[];
  expression: {
    language?: string;
    constraint?: string;
    maxSentences?: number;
    validator?: string;
    blockedBy?: string;
  };
  mode?: string;
  turnIndex?: number;
}

function clamp01(v: number): number {
  if (typeof v !== "number") return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function formatLabel(key: string): string {
  const map: Record<string, string> = {
    pauseSignal: "Pause",
    contactSignal: "Contact",
    depthSignal: "Depth",
    asymmetrySignal: "Asymmetry",
    scaleLevel: "Scale level",
    scaleJump: "Scale jump",
  };
  return map[key] || key;
}

function formatValue(value: number | boolean | undefined, key: string): string {
  if (key === "scaleLevel") {
    const level = typeof value === "number" ? value : 1;
    return `L${level}`;
  }
  if (key === "scaleJump") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "number") {
    return `${Math.round(value * 100)}%`;
  }
  return "—";
}

function formatAnchorLabel(key: string): string {
  const map: Record<string, string> = {
    role_signal: "Role signal",
    addressee_signal: "Addressee signal",
    time_signal: "Time signal",
    scale_position_signal: "Scale signal",
    inner_source_signal: "Inner source",
    commitment_signal: "Commitment",
    perspective_stability: "Perspective stability",
    dominant_role: "Dominant role",
    dominant_addressee: "Dominant addressee",
    time_frame: "Time frame",
    scale_position: "Scale position",
    role_loss_event: "Role loss",
    addressless_event: "Addressless",
    time_collapse_event: "Time collapse",
    commitment_drop_event: "Commitment drop",
    perspective_blur_event: "Perspective blur",
  };
  return map[key] || key;
}

function formatAnchorValue(value: number | string | undefined): string {
  if (typeof value === "number") {
    return `${Math.round(value * 100)}%`;
  }
  return "—";
}

function formatAnchorTextValue(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") return String(value);
  return String(value);
}

const PROMPT_PLACEHOLDER = `=== SYSTEM PROMPT ===

(Waiting for first message…)

=== USER PROMPT ===

(Send a message to see the full prompt sent to the LLM.)`;

function highlightPrompt(text: string): string {
  if (!text || !text.trim()) {
    return PROMPT_PLACEHOLDER.split("\n")
      .map((line) => {
        if (line.match(/^=== .+ ===$/)) {
          return `<span class="term-section">${line}</span>`;
        }
        return `<span class="term-comment">${line}</span>`;
      })
      .join("\n");
  }

  const lines = text.split("\n");
  const highlighted = lines
    .map((line) => {
      if (line.match(/^=== .+ ===$/)) {
        return `<span class="term-section">${line}</span>`;
      }

      const keyValueMatch = line.match(/^([A-Z_]+):\s*(.+)$/);
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch;
        if (value.match(/^".*"$/)) {
          return `<span class="term-key">${key}:</span> <span class="term-string">${value}</span>`;
        }
        if (value.match(/^\d+/)) {
          return `<span class="term-key">${key}:</span> <span class="term-number">${value}</span>`;
        }
        return `<span class="term-key">${key}:</span> <span class="term-value">${value}</span>`;
      }

      if (line.includes("FORBID")) {
        return line.replace(/(FORBID[^:]*:)/g, '<span class="term-forbid">$1</span>');
      }

      if (line.includes("ONLY")) {
        return line.replace(/(ONLY[^:]*:)/g, '<span class="term-only">$1</span>');
      }

      if (line.match(/(signal|threshold|guideline)/i)) {
        return line
          .replace(/(\d+\.\d+)/g, '<span class="term-number">$1</span>')
          .replace(/(signal|threshold|guideline)/gi, '<span class="term-instruction">$1</span>');
      }

      if (line.match(/\d+\.\d+/)) {
        return line.replace(/(\d+\.\d+)/g, '<span class="term-number">$1</span>');
      }

      if (!line.trim()) {
        return "";
      }

      return line;
    })
    .join("\n");

  return highlighted;
}

export function DebugPanel() {
  const router = useRouter();
  // Initialize with empty string to avoid hydration mismatch
  const [sessionId, setSessionId] = useState<string>("");
  const [turnIndex, setTurnIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [topic, setTopic] = useState("Testing Tact0 engine");
  const [debugState, setDebugState] = useState<DebugState>({
    metrics: {},
    signals: {},
    anchors: {},
    vnpEvents: {},
    warnings: [],
    expression: {},
  });
  const [prompt, setPrompt] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLPreElement>(null);

  // Initialize sessionId on client side only (after hydration)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tact0-session-id");
      const newSessionId = stored || crypto.randomUUID();
      setTimeout(() => {
        setSessionId(newSessionId);
      }, 0);
      if (!stored) {
        localStorage.setItem("tact0-session-id", newSessionId);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionId) {
      localStorage.setItem("tact0-session-id", sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.innerHTML = prompt ? highlightPrompt(prompt) : highlightPrompt(PROMPT_PLACEHOLDER);
    }
  }, [prompt]);

  const mutation = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      return await debugChatWithEngine({ text, sessionId });
    },
    onSuccess: (data: DebugChatResponse, vars) => {
      setMessages((prev) => [
        ...prev,
        {
          author: "You",
          text: vars.text,
          variant: "user",
        },
        {
          author: "Tact0",
          text: data.text || data.prompt || data.llmPrompt || "No response",
          variant: "engine",
        },
      ]);

      setTurnIndex((prev) => prev + 1);

      // Update debug state
      const state = data.state as DebugState;
      setDebugState({
        metrics: state?.metrics || {},
        signals: state?.metrics || {},
        anchors: state?.anchors || {},
        vnpEvents: state?.vnpEvents || {},
        warnings: data.warnings || [],
        expression: data.expression ? {
          ...data.expression,
          blockedBy: data.expression.blockedBy ?? undefined,
        } : {},
        mode: data.mode,
        turnIndex: state?.turnIndex ?? turnIndex + 1,
      });

      setPrompt(data.llmPrompt || "");
      setInput("");
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          author: "Engine",
          text: `Error: ${error.message || "request_failed"}`,
          variant: "engine",
        },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || mutation.isPending) return;
    mutation.mutate({ text });
  };

  const handleClearSession = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setTurnIndex(0);
    setMessages([]);
    setPrompt("");
    setDebugState({
      metrics: {},
      signals: {},
      anchors: {},
      vnpEvents: {},
      warnings: [],
      expression: {},
    });
  };

  const currentTurnIndex = debugState.turnIndex ?? turnIndex;

  return (
    <div className="debug-app">
      <aside className="debug-sidebar">
        <header className="debug-brand">
          <div className="debug-brand-dot debug-dot-red"></div>
          <div className="debug-brand-dot debug-dot-yellow"></div>
          <div className="debug-brand-dot debug-dot-green"></div>
          <span className="debug-brand-name text-black">Tact0 - Debugger</span>
        </header>

        <div className="debug-section-group">
          <div className="debug-section-header">Engine Metrics</div>

          <section className="debug-panel">
            <div className="debug-panel-title">State (current)</div>
            <div className="debug-metrics">
              {METRICS_KEYS.map((key) => {
                const value = Number(debugState.metrics[key] ?? 0);
                return (
                  <div key={key} className="debug-metric-row">
                    <div className="debug-metric-label">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div className="debug-metric-bar">
                      <div
                        className="debug-metric-fill"
                        style={{ width: `${Math.round(value * 100)}%` }}
                      />
                    </div>
                    <div className="debug-metric-value">{Math.round(value * 100)}%</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="debug-panel">
            <div className="debug-panel-title">Mode</div>
            <div className="debug-mode-grid">
              {MODES.map((mode) => (
                <span
                  key={mode}
                  className={`debug-pill ${debugState.mode === mode ? "debug-pill-active" : "debug-pill-ghost"}`}
                >
                  {mode}
                </span>
              ))}
            </div>
          </section>

          <section className="debug-panel">
            <div className="debug-panel-title">Signals (Pattern Layer)</div>
            <div className="debug-metrics">
              {SIGNALS_KEYS.map((key) => {
                const value = debugState.signals[key];
                let percent = 0;
                if (typeof value === "number") {
                  if (key === "scaleLevel") {
                    percent = clamp01((value - 1) / 3);
                  } else {
                    percent = clamp01(value);
                  }
                }
                return (
                  <div key={key} className="debug-metric-row">
                    <div className="debug-metric-label">{formatLabel(key)}</div>
                    <div className="debug-metric-bar">
                      <div
                        className="debug-metric-fill"
                        style={{ width: `${Math.round(percent * 100)}%` }}
                      />
                    </div>
                    <div className="debug-metric-value">{formatValue(value as number | boolean, key)}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="debug-panel">
            <div className="debug-panel-title">Anchors</div>
            <div className="debug-metrics">
              {VNP_SIGNAL_KEYS.map((key) => {
                const value = debugState.anchors[key];
                const percent = typeof value === "number" ? clamp01(value) : 0;
                return (
                  <div key={key} className="debug-metric-row">
                    <div className="debug-metric-label">{formatAnchorLabel(key)}</div>
                    <div className="debug-metric-bar">
                      <div
                        className="debug-metric-fill"
                        style={{ width: `${Math.round(percent * 100)}%` }}
                      />
                    </div>
                    <div className="debug-metric-value">{formatAnchorValue(value as number)}</div>
                  </div>
                );
              })}
            </div>
            <div className="debug-anchor-categoricals">
              {VNP_CATEGORICAL_KEYS.map((key) => {
                const value = debugState.anchors[key];
                return (
                  <div key={key} className="debug-tag">
                    <span className="debug-tag-label">{formatAnchorLabel(key)}</span>
                    <span>{formatAnchorTextValue(value as string | number)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="debug-panel">
            <div className="debug-panel-title">Anchor Events</div>
            <div className="debug-event-grid">
              {VNP_EVENT_KEYS.map((key) => {
                const active = Boolean(debugState.vnpEvents[key]);
                return (
                  <div key={key} className={`debug-event-chip ${active ? "" : "debug-event-chip-off"}`}>
                    <span>{formatAnchorLabel(key)}</span>
                    <span className="debug-event-status">{active ? "ACTIVE" : "OFF"}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="debug-section-group">
          <div className="debug-section-header">Expression Metrics</div>

          <section className="debug-panel">
            <div className="debug-panel-title">Expression</div>
            <div className="debug-expression">
              <div className="debug-expression-row">
                <div className="debug-expression-label">Language</div>
                <div className="debug-expression-value">{debugState.expression.language ?? "None"}</div>
              </div>
              <div className="debug-expression-row">
                <div className="debug-expression-label">Constraint</div>
                <div className="debug-expression-value">{debugState.expression.constraint ?? "—"}</div>
              </div>
              <div className="debug-expression-row">
                <div className="debug-expression-label">Max sentences</div>
                <div className="debug-expression-value">
                  {debugState.expression.maxSentences ?? "None"}
                </div>
              </div>
              <div className="debug-expression-row">
                <div className="debug-expression-label">Validator</div>
                <div className="debug-expression-value">{debugState.expression.validator ?? "None"}</div>
              </div>
              <div className="debug-expression-row">
                <div className="debug-expression-label">Blocked by</div>
                <div className="debug-expression-value">{debugState.expression.blockedBy ?? "None"}</div>
              </div>
            </div>
          </section>
        </div>

        <div className="debug-section-group">
          <div className="debug-section-header">Debug & Warnings / Blockers</div>

          <section className="debug-panel">
            <div className="debug-panel-title">Warnings</div>
            <ul className="debug-list">
              {debugState.warnings.length === 0 ? (
                <li>None</li>
              ) : (
                debugState.warnings.map((warning, idx) => <li key={idx}>{warning}</li>)
              )}
            </ul>
          </section>

          <section className="debug-panel">
            <div className="debug-panel-title">Debug</div>
            <div className="debug-debug">
              <div className="text-black">
                Session: <span>{sessionId || "—"}</span>
              </div>
            </div>
          </section>
        </div>
      </aside>

      <main className="debug-chat">
        <header className="debug-chat-header">
          <div className="debug-session-info">
            <div className="debug-session-title">Session</div>
            <input
              id="topic"
              className="debug-session-input text-black"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="debug-turn-indicator">Turn {currentTurnIndex}</div>
          </div>
          <div className="debug-action-buttons">
            <button
              type="button"
              className="debug-clear-session-btn"
              onClick={handleClearSession}
              title="Clear session cache and start fresh (Turn → 1)"
            >
              Clear session
            </button>
            <button
              type="button"
              className="debug-clear-session-btn"
              onClick={() => window.open("https://grafana.com", "_blank")}
              title="Navigate to Grafana dashboard"
            >
              Grafana
            </button>
            <div>---</div>
            <button
              type="button"
              className="debug-clear-session-btn"
              onClick={() => router.push(ROUTES.CHAT)}
              title="Navigate back to Client UI">
              Back to Client UI
            </button>
          </div>
        </header>

        <div ref={messagesRef} className="debug-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`debug-msg debug-msg-${msg.variant}`}>
              <div className="debug-msg-meta">{msg.author}</div>
              <div className="debug-msg-bubble">{msg.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="debug-composer">
          <input
            id="text"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message and press Enter…"
            autoComplete="off"
            disabled={mutation.isPending}
            required
          />
          <button type="submit" disabled={mutation.isPending}>
            Send
          </button>
        </form>

        <section className="debug-prompt-section">
          <div className="debug-prompt-header">
            <span className="debug-prompt-title">Final LLM Prompt</span>
          </div>
          <div className="debug-prompt-content">
            <pre ref={promptRef} className="debug-prompt-text"></pre>
          </div>
        </section>
      </main>
    </div>
  );
}
