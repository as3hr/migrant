import { generateText, Output, type GenerateTextEndEvent, type ToolSet } from "ai";
import type { Context } from "node:vm";
import z from "zod";
import { appContext } from "../../domain/index.ts";
import { openRouter } from "../../infrastructure/index.ts";
import type { DbChatMessageRowType, DbChatSessionType } from "../../types/table_types.ts";

export class MemoryService {
    async setResponseIntoMemory(response: GenerateTextEndEvent<NoInfer<ToolSet>, NoInfer<Context>>) {
        const user = await appContext.services.authService.getCurrentUser();
        const sessionId = appContext.currentChatSessionId;
        if (!user || !sessionId) return;
        
        const cost = appContext.services.usageTracker.calculateCostUsd(
            response.model.modelId,
            response.usage.inputTokens ?? 0,
            response.usage.outputTokens ?? 0,
        );
    
        const message: Omit<DbChatMessageRowType, 'id'> = {
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
    
        await appContext.services.databaseService.setChatMessage(sessionId, message);
    }

    async setQuestionIntoMemory(question: string) {
        const user = await appContext.services.authService.getCurrentUser();
        if (!user) return;

        let sessionId = appContext.currentChatSessionId;
        if (!sessionId) {
            let title = "New Conversation";
            try {
                const { output } = await generateText({
                    model: openRouter("openai/gpt-4o-mini"),
                    output: Output.object({
                        schema: z.object({ title: z.string() }),
                    }),
                    instructions: [{
                        role: "system",
                        content: "Create a concise 3-4 word title for this chat topic based on the prompt.",
                    }],
                    temperature: 0,
                    maxOutputTokens: 50,
                    prompt: question,
                });
                title = output.title;
            } catch (e) {
                appContext.commandCtx?.log(`Error in creating title for new conversation ${e}`);
             }

            const newSession: Omit<DbChatSessionType, "id"> = {
                user_id: user.id,
                title: title,
                session_token_limit: 100000,
                session_token_used: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const session = await appContext.services.databaseService.setNewSession(newSession);
            sessionId = session.id;
            appContext.currentChatSessionId = sessionId;
        }

        const userMessage: Omit<DbChatMessageRowType, "id"> = {
            session_id: sessionId,
            user_id: user.id,
            role: "user",
            content: question,
            provider: "user",
            model_name: "user",
            target_agent: "input",
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
            cost_usd: 0,
            created_at: new Date().toISOString(),
        };
    
        await appContext.services.databaseService.setChatMessage(sessionId, userMessage);
    }
}