import type { ModelMessage } from "ai";
import { appContext } from "../../domain/index.ts";
import { localChatRepository } from "../../local/repositories/local_chat.repository.ts";

export class ContextManager {
    private maxHistoryMessages: number = 10;

    async getContext(): Promise<ModelMessage[]> {
        const sessionId = appContext.currentChatSessionId;
        if (!sessionId) return [];

        try {
            const dbMessages = localChatRepository.getChatMessages(sessionId);
            if (!dbMessages || dbMessages.length === 0) return [];

            const modelMessages: ModelMessage[] = dbMessages
                .filter((msg) => msg.role === "user" || msg.role === "assistant")
                .map((msg) => ({
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                }));

            const slicedMessages = modelMessages.length > this.maxHistoryMessages
                ? modelMessages.slice(-this.maxHistoryMessages)
                : modelMessages;

            return slicedMessages;
        } catch (error) {
            console.error("[ContextManager] Error retrieving context:", error);
            return [];
        }
    }
}
