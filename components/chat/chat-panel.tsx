import { ChatPanelClient } from "@/components/chat/chat-panel-client";

export function ChatPanel() {
  return (
    <div className="flex h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
      <ChatPanelClient />
    </div>
  );
}
