import { generateText, streamText, type ModelMessage } from 'ai';
import { openRouter } from '../../infrastructure/index.ts';
import { SYS_DEFAULT_MODEL } from '../../utils/index.ts';

export class LlmService {
    async queryLlm(systemPrompt: string, userPrompt: string, model?: string, messages?: ModelMessage[]): Promise<string | null> {
        try {
            const { text } = await generateText({
                model: openRouter.chat(model ?? SYS_DEFAULT_MODEL),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: messages ?? [
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                onEnd: (result) => {
                    
                },
            });

            return text;
        } catch (llmE) {
            console.log('Error in querying llm', llmE);
            return null;
        }
    }

    async *streamLlm(systemPrompt: string, userPrompt: string, model?: string, messages?: ModelMessage[]) {
        try {
            const result = streamText({
                model: openRouter.chat(model ?? SYS_DEFAULT_MODEL),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: messages ?? [
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                onEnd: (result) => {

                },
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