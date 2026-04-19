import { MessageThread } from "@/components/chat/MessageThread";
import { QueryInput } from "@/components/chat/QueryInput";
import { mockWorkspace } from "@/lib/mock-data";

export default function ChatWorkspacePage() {
  return (
    <div className="page-grid" style={{ minHeight: "100%" }}>
      <MessageThread messages={mockWorkspace.chatMessages} />
      <div style={{ position: "sticky", bottom: 0, paddingBottom: 8 }}>
        <QueryInput />
      </div>
    </div>
  );
}
