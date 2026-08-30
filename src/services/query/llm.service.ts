import { generateText, streamText, type GenerateTextOnEndCallback, type ModelMessage, type ToolSet } from 'ai';
import type { Context } from 'node:vm';
import { appContext } from '../../domain/index.ts';

export class LlmService {
    async queryLlm(systemPrompt: string, messages: ModelMessage[], model?: string, onEnd?: GenerateTextOnEndCallback<NoInfer<ToolSet>, NoInfer<Context>>): Promise<string | null> {
        try {
            const { text } = await generateText({
                model: appContext.providerSdk(model ?? appContext.selectedModel.modelId),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: messages,
                onEnd: (result) => {
                    onEnd?.(result);
                },
            });

            return text;
        } catch (llmE) {
            return null;
        }
    }

    async *streamLlm(systemPrompt: string, messages: ModelMessage[], model?: string, onEnd?: GenerateTextOnEndCallback<NoInfer<ToolSet>, NoInfer<Context>>) {
        try {
            const result = streamText({
                model: appContext.providerSdk(model ?? appContext.selectedModel.modelId),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: messages,
                onEnd: (result) => {
                    onEnd?.(result);
                },
            });

            for await (const chunk of result.textStream) {
                if (chunk) {
                    yield chunk;
                }
            }
        } catch (llmE) {}
    }
}