import type { ModelMessage } from "ai";
import { appContext } from "../../domain/index.ts";
import { localChatRepository } from "../../local/repositories/local_chat.repository.ts";

export class ContextManager {
    private maxHistoryTokenBudget: number = 4000; /// token budget

    /** 4-char per token estimate */
    private estimateTokens(text: string): number {
        return Math.ceil((text ?? "").length / 4);
    }

    /** Prunes heavy raw schema dumps from older assistant messages */
    private pruneHistoricalContent(content: string): string {
        if (content.length > 500 && content.includes("### Database:")) {
            return content.replace(/### Database:[\s\S]*?(?=\n###|\n\n[A-Z]|$)/g, (match) => {
                const dbHeader = match.split("\n")[0];
                return `${dbHeader}\n*[Schema Introspection Details Pruned from History]*`;
            });
        }
        return content;
    }

    async getContext(): Promise<ModelMessage[]> {
        const sessionId = appContext.currentChatSessionId;
        if (!sessionId) return [];

        try {
            const dbMessages = localChatRepository.getChatMessages(sessionId);
            if (!dbMessages || dbMessages.length === 0) return [];

            const validMessages = dbMessages.filter(
                (msg) => msg.role === "user" || msg.role === "assistant"
            );

            const selectedMessages: ModelMessage[] = [];
            let accumulatedTokens = 0;

            for (let i = validMessages.length - 1; i >= 0; i--) {
                const msg = validMessages[i]!;
                const isLatestMessage = i === validMessages.length - 1;

                const content = (msg.role === "assistant" && !isLatestMessage)
                    ? this.pruneHistoricalContent(msg.content)
                    : msg.content;

                const messageTokens = this.estimateTokens(content);

                if (accumulatedTokens + messageTokens > this.maxHistoryTokenBudget && selectedMessages.length > 0) {
                    break;
                }

                accumulatedTokens += messageTokens;
                selectedMessages.unshift({
                    role: msg.role as "user" | "assistant",
                    content: content,
                });
            }

            return selectedMessages;
        } catch (error) {
            console.error("[ContextManager] Error constructing token-budgeted context:", error);
            return [];
        }
    }
}
