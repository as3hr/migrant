import { openRouter, SYS_DEFAULT_MODEL } from "@src/exports.ts";
import { generateText, streamText } from 'ai';

export class LlmService {
    async queryLlm(systemPrompt: string, userPrompt: string, model?: string): Promise<string | null> {
        try {
            const { text } = await generateText({
                model: openRouter.chat(model ?? SYS_DEFAULT_MODEL),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: [
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
                model: openRouter.chat(model ?? SYS_DEFAULT_MODEL),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: [
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
            console.error(`Error in streaming llm: ${llmE}`);
        }
    }
}