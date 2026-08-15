import type { EventStream } from "@openrouter/sdk/lib/event-streams.js";
import type { ChatResult, ChatStreamChunk } from "@openrouter/sdk/models";
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


    async *streamLlm(systemPrompt: string, userPrompt: string, model?: string) {
        try {
            const response = await openRouter.chat.send({
                chatRequest: {
                    model: model ?? SYS_DEFAULT_MODEL,
                    stream: true,
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
            
            for await (const chunk of (response as EventStream<ChatStreamChunk>)) {
                if ('error' in chunk) {
                  console.error(`Stream error: ${chunk?.error?.message}`);
                  if (chunk.choices?.[0]?.finishReason === 'error') {
                    console.log('Stream terminated due to error');
                  }
                  return;
                }
          
                const content = chunk.choices?.[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        }
        catch (llmE) {
            console.log('Error in streaming llm', llmE);
        }
    }
}