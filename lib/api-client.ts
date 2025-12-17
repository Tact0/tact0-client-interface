import { engineChatResponseSchema, loginResponseSchema } from "./schemas";
import type { LoginResponse, EngineChatResponse } from "./schemas";

/**
 * Generic API request handler with error handling and validation
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: T } }
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  const json = await res.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid response format");
  }

  return parsed.data as T;
}

/**
 * Authenticate user with email and password
 */
export async function loginRequest(input: { email: string; password: string }): Promise<LoginResponse> {
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
 * Send a chat message to the engine through the protected proxy
 */
export async function chatWithEngine(input: { text: string }): Promise<EngineChatResponse> {
  return apiRequest<EngineChatResponse>(
    "/api/chat",
    {
      method: "POST",
      body: JSON.stringify({ text: input.text }),
    },
    engineChatResponseSchema
  );
}
