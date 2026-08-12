import type { ChatResult } from "@openrouter/sdk/models";
import { openRouter, SYS_DEFAULT_MODEL } from "@src/exports.ts";

export class LlmService {
    async queryLlm(systemPrompt: string, userPrompt: string, model?: string): Promise<ChatResult | null> {
        try {
            const response = await openRouter.chat.send({
                chatRequest: {
                    model: model ?? SYS_DEFAULT_MODEL,
                    stream: false,
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt,
                        },
                        {
                            role: "user",
                            content: userPrompt,
                        },
                    ],
                },
            });
            return response as ChatResult;
        }
        catch (llmE) {
            console.log('Error in querying llm', llmE);
            return null;
        }
    }
}

export const llmService = new LlmService();