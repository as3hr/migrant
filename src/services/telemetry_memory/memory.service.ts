import { type GenerateTextEndEvent, type ToolSet } from "ai";
import { randomUUID } from "node:crypto";
import type { Context } from "node:vm";
import { appContext } from "../../domain/index.ts";
import type { IChatMessageModel, IChatSessionsModel } from "../../infrastructure/index.ts";
import { tblChatMessage, tblChatSessions } from "../../infrastructure/index.ts";
import { appEmitter } from "../../utils/emitter.ts";

export class MemoryService {
    async saveTurnToMemory(
        response: GenerateTextEndEvent<NoInfer<ToolSet>, NoInfer<Context>>,
        targetAgent?: string
    ) {
        try {
            const user = await appContext.services.authService.getCurrentUser();
            const sessionId = appContext.currentChatSessionId;
            if (!user || !sessionId) return;

            const promptTokens = response.usage.inputTokens ?? 0;
            const completionTokens = response.usage.outputTokens ?? 0;
            const totalTokens = response.usage.totalTokens ?? (promptTokens + completionTokens);

            const cost = appContext.services.contextManager.calculateCostUsd(
                response.model.modelId,
                promptTokens,
                completionTokens
            );

            const now = Date.now();

            const assistantMessage: IChatMessageModel = {
                id: randomUUID(),
                session_id: sessionId,
                user_id: user.id,
                role: 'assistant',
                content: response.text,
                provider: response.model.provider,
                model_name: response.model.modelId,
                target_agent: targetAgent ?? response.model.modelId,
                prompt_tokens: promptTokens,
                completion_tokens: completionTokens,
                total_tokens: totalTokens,
                cost_usd: cost,
                created_at: new Date(now).toISOString(),
            };

            tblChatMessage.setChatMessage(assistantMessage);

            const currentSession = tblChatSessions.getChatSessionById(sessionId);
            if (currentSession) {
                const sessionTotalTokensUsed = (currentSession.session_token_used || 0) + totalTokens;
                const updatedSession = tblChatSessions.setChatSession({
                    ...currentSession,
                    session_token_used: sessionTotalTokensUsed,
                    updated_at: new Date().toISOString(),
                });

                appEmitter.emit('update-session', {
                    updatedSession,
                });

            }
        } catch (error) {
            console.error("Error saving chat memory:", error);
        }
    }

    async ensureActiveSession(question: string) {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user) return;

        let sessionId = appContext.currentChatSessionId;
        if (!sessionId) {
            const title = await appContext.services.llmService.generateTitle(question);

            const tokenLimit = appContext.services.contextManager.getHistoryTokenBudget(appContext.selectedModel.modelId);

            const newSession: IChatSessionsModel = {
                id: randomUUID(),
                user_id: user.id,
                title: title,
                session_token_limit: tokenLimit,
                session_token_used: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const session = tblChatSessions.setChatSession(newSession);
            if (session) {
                sessionId = session.id;
                appContext.currentChatSessionId = sessionId;

                appEmitter.emit('update-session', {
                    updatedSession: session,
                });
            }
        }
        if (sessionId) {
            const userMessage: IChatMessageModel = {
                id: randomUUID(),
                session_id: sessionId,
                user_id: user.id,
                role: 'user',
                content: question,
                provider: "user",
                model_name: "user",
                target_agent: "user",
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
                cost_usd: 0,
                created_at: new Date().toISOString(),
            };
            tblChatMessage.setChatMessage(userMessage);
        }
    }
}
