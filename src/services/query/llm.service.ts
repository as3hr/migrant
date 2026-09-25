import { generateText, Output, streamText, type GenerateTextOnEndCallback, type ModelMessage, type ToolSet } from 'ai';
import type { Context } from 'node:vm';
import z from "zod";
import { appContext } from '../../domain/index.ts';
import { openRouter } from '../../infrastructure/index.ts';

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
            appContext.commandCtx?.log(`Error in LLM query ${llmE}`);
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
        } catch (llmE) {
            appContext.commandCtx?.log(`Error in stream llm: ${llmE}`);
        }
    }

    async generateTitle(question: string): Promise<string> {
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
            return output.title;
        } catch (e) {
            appContext.commandCtx?.log(`Error in creating title for new conversation ${e}`);
            return "Untitled Conversation";
        }
    }
}