import { useEffect, useState } from "react";
import { appContext } from "../../domain/index.ts";
import type { IChatSessionsModel } from "../../infrastructure/index.ts";
import { emitEvent } from "../../utils/emitter.ts";
import type { OutputItem } from "../components/output.tsx";

export interface UseChatOutputsReturn {
  outputs: OutputItem[];
  appendOutput: (item: OutputItem) => void;
  startAssistantStream: () => void;
  updateAssistantStream: (data: { text: string; reasoning: string }) => void;
  replaceLastWithItem: (item: OutputItem) => void;
  clearOutputs: () => void;
  setOutputs: React.Dispatch<React.SetStateAction<OutputItem[]>>;
  loadSessionMessages: (sessionId: string) => Promise<number>;
}

export function useChatOutputs(onSessionMessagesLoaded?: (count: number) => void): UseChatOutputsReturn {
  const [outputs, setOutputs] = useState<OutputItem[]>([]);

  const appendOutput = (item: OutputItem) => {
    setOutputs((prev) => [...prev, item]);
  };

  const startAssistantStream = () => {
    setOutputs((prev) => [
      ...prev,
      {
        type: "assistant",
        isStreaming: true,
      },
    ]);
  };

  const updateAssistantStream = (data: { text: string; reasoning: string }) => {
    setOutputs((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1]!;
      if (last.type === "assistant" && last.isStreaming) {
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            streamText: data.text,
            reasoningStream: data.reasoning,
          },
        ];
      }
      return prev;
    });
  };

  const replaceLastWithItem = (item: OutputItem) => {
    setOutputs((prev) => {
      if (prev.length === 0) return [item];
      const last = prev[prev.length - 1]!;
      if (last.type === "assistant") {
        return [...prev.slice(0, -1), item];
      }
      return [...prev, item];
    });
  };

  const clearOutputs = () => {
    setOutputs([]);
  };

  const loadSessionMessages = async (sessionId: string): Promise<number> => {
    const messages = await appContext.services.chatSessionService.getSessionMessages(sessionId);
    const mappedOutputs: OutputItem[] = messages.map((msg) => {
      if (msg.role === "user") {
        return { type: "user", content: msg };
      }
      return { type: "assistant", content: msg };
    });
    setOutputs(mappedOutputs);
    onSessionMessagesLoaded?.(mappedOutputs.length);
    return mappedOutputs.length;
  };

  useEffect(() => {
    const handleUpdateSession = async (data?: { updatedSession?: IChatSessionsModel; isSwitch?: boolean }) => {
      if (data?.isSwitch && data.updatedSession) {
        await loadSessionMessages(data.updatedSession.id);
      }
    };

    emitEvent.on("update-session", handleUpdateSession);
    return () => {
      emitEvent.off("update-session", handleUpdateSession);
    };
  }, []);

  return {
    outputs,
    appendOutput,
    startAssistantStream,
    updateAssistantStream,
    replaceLastWithItem,
    clearOutputs,
    setOutputs,
    loadSessionMessages,
  };
}
