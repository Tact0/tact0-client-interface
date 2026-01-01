/**
 * Application-wide constants
 */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "invalid_credentials",
  INVALID_INPUT: "invalid_input",
  USER_EXISTS: "user_exists",
  UNAUTHORIZED: "unauthorized",
  MISSING_ENGINE_URL: "missing_engine_url",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CHAT: "/chat",
} as const;

export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const QUERY_CONFIG = {
  RETRY: 1,
  STALE_TIME: 1000 * 30, // 30 seconds
  REFETCH_ON_WINDOW_FOCUS: false,
} as const;
