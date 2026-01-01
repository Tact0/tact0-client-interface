"use client";

import { create } from "zustand";
import type { Session } from "@/lib/types";
import { getSessionRequest, logoutRequest } from "@/lib/api-client";

export type AuthState = {
  session?: Session;
  hydrated: boolean;
  setSession: (session: Session | undefined) => void;
  logout: () => Promise<void>;
  hydrate: (initialSession?: Session | null) => Promise<void>;
};

export const useSessionStore = create<AuthState>((set) => ({
  session: undefined,
  hydrated: false,
  setSession: (session) => set({ session, hydrated: true }),
  logout: async () => {
    set({ session: undefined, hydrated: true });
    try {
      await logoutRequest();
    } catch {
      // Best-effort logout; session is already cleared locally.
    }
  },
  hydrate: async (initialSession) => {
    if (initialSession) {
      set({ session: initialSession, hydrated: true });
      return;
    }

    try {
      const data = await getSessionRequest();
      set({ session: data.user ?? undefined, hydrated: true });
    } catch {
      set({ session: undefined, hydrated: true });
    }
  },
}));
