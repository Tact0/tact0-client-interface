"use client";

import { create } from "zustand";
import type { Session } from "@/lib/types";

type SessionState = {
  session?: Session;
  hydrated: boolean;
  setSession: (session: Session | undefined) => void;
  clear: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: undefined,
  hydrated: false,
  setSession: (session) => set({ session, hydrated: true }),
  clear: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ session: undefined, hydrated: true });
  },
  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        set({ session: undefined, hydrated: true });
        return;
      }
      const data = await res.json();
      set({ session: data.user, hydrated: true });
    } catch {
      set({ session: undefined, hydrated: true });
    }
  },
}));
