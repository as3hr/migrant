import type { SendChatCompletionRequestResponse } from "@openrouter/sdk/models/operations";
import { openRouter, SYS_DEFAULT_MODEL } from "@src/exports.ts";

class LlmService {
    async queryLlm(systemPrompt: string, userPrompt: string, model?: string): Promise<SendChatCompletionRequestResponse | null> {
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
            return response;
        }
        catch (llmE) {
            console.log('Error in querying llm', llmE);
            return null;
        }
    }
}

export const llmService = new LlmService();