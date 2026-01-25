"use client";

import { create } from "zustand";
import type { Message } from "@/lib/types";

export type ChatState = {
  draft: string;
  messages: Message[];
  setDraft: (draft: string) => void;
  clearDraft: () => void;
  appendMessage: (message: Message) => void;
  reset: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  draft: "",
  messages: [],
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: "" }),
  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  reset: () => set({ draft: "", messages: [] }),
}));
