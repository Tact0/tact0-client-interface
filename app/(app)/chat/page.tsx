import { SiteShell } from "@/components/layout/site-shell";
import dynamic from "next/dynamic";
import { ChatPanelLoading } from "@/components/chat/chat-panel-loading";

const ChatPanel = dynamic(
  () => import("@/components/chat/chat-panel").then((mod) => mod.ChatPanel),
  { loading: () => <ChatPanelLoading /> }
);

export default function ChatPage() {
  return (
    <SiteShell>
      <ChatPanel />
    </SiteShell>
  );
}
