import type { ModelMessage } from "ai";
import { appContext } from "../../domain/index.ts";
import { localChatRepository } from "../../infrastructure/index.ts";

export class ContextManager {
    private maxHistoryTokenBudget: number = 4000;

    private estimateTokens(text: string): number {
        return Math.ceil((text ?? "").length / 4);
    }

    private pruneHistoricalContent(content: string): string {
        if (content.length > 500 && content.includes("### Database:")) {
            return content.replace(/### Database:[\s\S]*?(?=\n###|\n\n[A-Z]|$)/g, (match) => {
                const dbHeader = match.split("\n")[0];
                return `${dbHeader}\n*[Schema Introspection Details Pruned from History]*`;
            });
        }
        return content;
    }

    async getContext(userPrompt: string): Promise<ModelMessage[]> {
        const sessionId = appContext.currentChatSessionId;
        if (!sessionId) return [];
        const newMessage: ModelMessage = {
            role: 'user',
            content: userPrompt,
        };

        try {
            const dbMessages = localChatRepository.getChatMessages(sessionId);
            if (!dbMessages || dbMessages.length === 0) return [];

            const validMessages = dbMessages.filter(
                (msg: any) => msg.role === "user" || msg.role === "assistant"
            );

            let selectedMessages: ModelMessage[] = [];
            let accumulatedTokens = 0;

            selectedMessages.push(newMessage);
            accumulatedTokens += this.estimateTokens(userPrompt);

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