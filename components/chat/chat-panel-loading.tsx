export function ChatPanelLoading() {
  return (
    <div className="flex h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
      <div className="hidden md:flex w-[280px] border-r border-border/50 bg-card p-4" />
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border/50 px-4 md:px-6 py-3 md:py-4" />
        <div className="flex-1 px-4 md:px-6 py-4 space-y-3">
          <div className="h-16 w-3/4 rounded-lg bg-muted/40" />
          <div className="h-16 w-2/3 rounded-lg bg-muted/30" />
          <div className="h-16 w-1/2 rounded-lg bg-muted/20" />
        </div>
        <div className="border-t border-border/50 px-4 md:px-8 lg:px-12 py-6">
          <div className="h-12 rounded-md bg-muted/40" />
        </div>
      </div>
    </div>
  );
}
