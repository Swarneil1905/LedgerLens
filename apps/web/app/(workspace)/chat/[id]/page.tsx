import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { ChatSessionPanel } from "@/components/chat/ChatSessionPanel";
import { apiGetJson } from "@/lib/api-client";
import { mapChatMessage } from "@/lib/mappers";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ChatWorkspacePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const tickerRaw = query.ticker;
  const ticker = typeof tickerRaw === "string" && tickerRaw.length > 0 ? tickerRaw : "AAPL";

  let history: unknown[] = [];
  try {
    history = await apiGetJson<unknown[]>(`/chat/${id}/history`);
  } catch {
    history = [];
  }

  const initialMessages = history.map((row) => mapChatMessage(row as Record<string, unknown>));

  return (
    <>
      <WorkspaceHeaderHydrator
        title={`${ticker} · Analysis session`}
        subtitle={ticker}
        breadcrumb={[{ label: ticker }, { label: "Analysis session" }]}
      />
      <ChatSessionPanel sessionId={id} ticker={ticker} initialMessages={initialMessages} />
    </>
  );
}
