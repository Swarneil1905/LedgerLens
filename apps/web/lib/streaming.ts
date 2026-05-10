export type ChatSseEvent =
  | {
      event: "meta";
      data: {
        envLlmProvider?: string;
        answerStream?: string;
        ollamaModel?: string | null;
      };
    }
  | { event: "text"; data: { chunk?: string } }
  | { event: "sources"; data: { sources?: unknown[] } }
  | { event: "followups"; data: { followUps?: string[] } }
  | { event: "chart"; data: { charts?: unknown[] } }
  | { event: "done"; data: { status?: string; ollamaError?: string } & Record<string, unknown> }
  | { event: string; data: unknown };

function parseSseBlock(block: string): ChatSseEvent | null {
  let eventName = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  if (!dataLines.length) {
    return null;
  }
  const payloadText = dataLines.join("\n");
  try {
    const data = JSON.parse(payloadText) as unknown;
    return { event: eventName, data: data as Record<string, unknown> } as ChatSseEvent;
  } catch {
    return { event: eventName, data: { raw: payloadText } };
  }
}

export async function* readChatSseStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<ChatSseEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";
      for (const block of parts) {
        if (!block.trim()) {
          continue;
        }
        const parsed = parseSseBlock(block);
        if (parsed) {
          yield parsed;
        }
      }
    }
    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) {
        yield parsed;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
