import { z } from "zod";

/**
 * User roles enum
 */
export const UserRoleSchema = z.enum(["USER", "ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Authentication input schema
 */
export const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * User data schema
 */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
});

/**
 * Login/Register response schema
 */
export const loginResponseSchema = z.object({
  user: userSchema.optional(),
});

/**
 * Engine chat response schema
 */
export const engineChatResponseSchema = z.object({
  mode: z.string().optional(),
  prompt: z.string(),
  state: z.unknown().optional(),
  warnings: z.array(z.string()).optional(),
});

// Type exports
export type AuthInput = z.infer<typeof authSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type EngineChatResponse = z.infer<typeof engineChatResponseSchema>;

