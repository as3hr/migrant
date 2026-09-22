import { type GenerateTextEndEvent, type ToolSet } from "ai";
import { randomUUID } from "node:crypto";
import type { Context } from "node:vm";
import { appContext } from "../../domain/index.ts";
import type { IChatMessageModel, IChatSessionsModel } from "../../infrastructure/index.ts";
import { tblChatMessage, tblChatSessions } from "../../infrastructure/index.ts";

export class MemoryService {
    async updateMem(response: GenerateTextEndEvent<NoInfer<ToolSet>, NoInfer<Context>>, question: string) {
        const user = await appContext.services.authService.getCurrentUser();
        const sessionId = appContext.currentChatSessionId;
        if (!user || !sessionId) return;
        
        const cost = appContext.services.usageTracker.calculateCostUsd(
            response.model.modelId,
            response.usage.inputTokens ?? 0,
            response.usage.outputTokens ?? 0,
        );


        const userMessage: IChatMessageModel = {
            id: randomUUID(),
            session_id: sessionId,
            user_id: user.id,
            role: 'user',
            content: question,
            provider: response.model.provider,
            model_name: response.model.modelId,
            target_agent: response.model.modelId,
            prompt_tokens: response.usage.inputTokens ?? 0,
            completion_tokens: response.usage.outputTokens ?? 0,
            total_tokens: response.usage.totalTokens ?? 0,
            cost_usd: cost,
            created_at: new Date().toISOString(),
        };

        const assistantMessage: IChatMessageModel = {
            id: randomUUID(),
            session_id: sessionId,
            user_id: user.id,
            role: 'assistant',
            content: response.text,
            provider: response.model.provider,
            model_name: response.model.modelId,
            target_agent: response.model.modelId,
            prompt_tokens: response.usage.inputTokens ?? 0,
            completion_tokens: response.usage.outputTokens ?? 0,
            total_tokens: response.usage.totalTokens ?? 0,
            cost_usd: cost,
            created_at: new Date().toISOString(),
        };
    
        tblChatMessage.setChatMessage(userMessage);
        tblChatMessage.setChatMessage(assistantMessage);
    }

    async setUpSession(question: string) {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user) return;

        let sessionId = appContext.currentChatSessionId;
        if (!sessionId) {
            const title = await appContext.services.llmService.generateTitle(question);

            const newSession: IChatSessionsModel = {
                id: randomUUID(),
                user_id: user.id,
                title: title,
                session_token_limit: 100000,
                session_token_used: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const session = tblChatSessions.setChatSession(newSession);
            if (session) {
                sessionId = session.id;
                appContext.currentChatSessionId = sessionId;
            }
        }
    }
}