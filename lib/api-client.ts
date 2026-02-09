import {
  debugChatResponseSchema,
  engineChatResponseSchema,
  loginResponseSchema,
  sessionResponseSchema,
} from "./schemas";
import type {
  DebugChatResponse,
  LoginResponse,
  EngineChatResponse,
  SessionResponse,
} from "./schemas";
import type { ZodSchema } from "zod";

/**
 * Generic API request handler with error handling and validation
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit,
  schema: ZodSchema<T>
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    // Try to parse error JSON for better error messages
    try {
      const errorJson = JSON.parse(text);
      const errorMessage = errorJson.error || errorJson.message || text;
      const error = new Error(errorMessage);
      // Attach details if available
      if (errorJson.details) {
        (error as any).details = errorJson.details;
      }
      throw error;
    } catch {
      // Not JSON, throw with text
      throw new Error(text || "Request failed");
    }
  }

  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    // TypeScript knows parsed.error exists when success is false
    // ZodError uses 'issues' property, not 'errors'
    const zodError = parsed.error;
    console.error("Schema validation failed:", {
      errors: zodError.issues,
      received: json,
    });
    const errorMessages = zodError.issues.map((issue) => 
      `${issue.path.map(String).join('.')}: ${issue.message}`
    ).join(', ');
    throw new Error(`Invalid response format: ${errorMessages}`);
  }

  return parsed.data;
}

/**
 * Authenticate user with email and password
 */
export async function loginRequest(input: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    loginResponseSchema
  );
}

/**
 * Get current session (401 returns user: null)
 */
export async function getSessionRequest(): Promise<SessionResponse> {
  const res = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    return { user: null };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  const json = await res.json();
  const parsed = sessionResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid response format");
  }

  return parsed.data;
}

/**
 * Logout current session
 */
export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Send a chat message to the engine through the protected proxy
 */
export async function chatWithEngine(input: {
  text: string;
}): Promise<EngineChatResponse> {
  return apiRequest<EngineChatResponse>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify({ text: input.text }),
    },
    engineChatResponseSchema
  );
}

/**
 * Send a chat message to the debug engine endpoint (admin only)
 * Returns full debug data including metrics, state, expression, etc.
 */
export async function debugChatWithEngine(input: { text: string; sessionId?: string }): Promise<DebugChatResponse> {
  return apiRequest<DebugChatResponse>(
    "/api/debug/chat",
    {
      method: "POST",
      body: JSON.stringify({ text: input.text, sessionId: input.sessionId }),
    },
    debugChatResponseSchema
  );
}
