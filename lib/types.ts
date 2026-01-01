/**
 * Centralized type definitions
 */

import type { UserRole } from "./schemas";

export type {
  UserRole,
  User,
  AuthInput,
  LoginResponse,
  SessionResponse,
  EngineChatResponse,
} from "./schemas";

export interface Session {
  email?: string;
  id?: string;
  role?: UserRole;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
