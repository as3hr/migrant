import { openRouter, SYS_DEFAULT_MODEL } from "@src/exports.ts";
import { gateway, generateText, streamText } from 'ai';

export class LlmService {
    async queryLlm(systemPrompt: string, userPrompt: string, model?: string): Promise<String | null> {
        try {
            const { text } = await generateText({
                model: openRouter(model ?? SYS_DEFAULT_MODEL),
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
            });

            return text;
        } catch (llmE) {
            console.log('Error in querying llm', llmE);
            return null;
        }
    }

    async *streamLlm(systemPrompt: string, userPrompt: string, model?: string) {
        try {
            const result = streamText({
                model: gateway(model ?? SYS_DEFAULT_MODEL),
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
              });
            
            for await (const chunk of result.textStream) {
                if (chunk) {
                    yield chunk;
                }
            }
        } catch (llmE) {
            console.log('Error in streaming llm', llmE);
        }
    }
}