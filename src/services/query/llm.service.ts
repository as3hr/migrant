import { generateText, streamText, type GenerateTextOnEndCallback, type ModelMessage, type ToolSet } from 'ai';
import type { Context } from 'node:vm';
import { appContext } from '../../domain/index.ts';

export class LlmService {
    async queryLlm(systemPrompt: string, userPrompt: string, model?: string, messages?: ModelMessage[], onEnd?: GenerateTextOnEndCallback<NoInfer<ToolSet>, NoInfer<Context>>): Promise<string | null> {
        try {
            const { text } = await generateText({
                model: appContext.providerSdk(model ?? appContext.selectedModel.modelId),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: (messages && messages.length > 0) ? [
                    ...messages,
                    {
                        role: "user",
                        content: userPrompt,
                    }
                ] : [
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                onEnd: (result) => {
                    onEnd?.(result);
                },
            });

            return text;
        } catch (llmE) {
            appContext.commandCtx?.error(`Error in querying llm: ${llmE}`);
            return null;
        }
    }

    async *streamLlm(systemPrompt: string, userPrompt: string, model?: string, messages?: ModelMessage[], onEnd?: GenerateTextOnEndCallback<NoInfer<ToolSet>, NoInfer<Context>>) {
        try {
            const result = streamText({
                model: appContext.providerSdk(model ?? appContext.selectedModel.modelId),
                instructions: [
                    {
                        role: "system",
                        content: systemPrompt,
                    },
                ],
                messages: (messages && messages.length > 0) ? [...messages, {
                        role: "user",
                        content: userPrompt,
                    }] : [
                    {
                        role: "user",
                        content: userPrompt,
                    },
                ],
                onEnd: (result) => {
                    onEnd?.(result);
                },
                onError: (result) => {
                    appContext.commandCtx?.error(`Error in streaming llm: ${JSON.stringify(result, null, 2)}`);
                }
            });

            for await (const chunk of result.textStream) {
                if (chunk) {
                    yield chunk;
                }
            }
        } catch (llmE) {
            appContext.commandCtx?.error(`Error in streaming llm: ${JSON.stringify(llmE, null, 2)}`);
        }
    }
}