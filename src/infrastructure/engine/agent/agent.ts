import type { User } from "@supabase/supabase-js";
import { generateText, type ToolModelMessage } from "ai";
import type { CommandContext } from "../../../domain/index.ts";
import { appContext } from "../../../domain/index.ts";
import { AGENT_SYSTEM_PROMPT } from "../prompts/agent_prompt.ts";
import { tools } from "../tools/tools.ts";

const MAX_STEPS = 10;

export async function runAgent(query: string, ctx: CommandContext): Promise<void> {
    const user = await appContext.services.authService.getCurrentUser();
    const databases = appContext.workspace.databases.map(db => db.name);

    const systemPrompt = buildSystemPromptWithContext(AGENT_SYSTEM_PROMPT, user, databases);

    const userMessage = await appContext.services.memoryService.ensureActiveSession(query);
    if (userMessage && ctx.output) {
        ctx.output({ type: "user", content: userMessage });
    }

    const messages = await appContext.services.contextManager.getContext(query);

    const startTime = Date.now();
    let thoughtTimeStr = "";
    let savedAssistantMsg: any = null;

    for (let step = 0; step < MAX_STEPS; step++) {
        const { text, toolCalls, toolResults, finishReason } = await generateText({
            model: appContext.providerSdk(appContext.selectedModel.modelId),
            system: systemPrompt,
            messages,
            tools,
            toolChoice: "auto",
            maxOutputTokens: 4000,
        });

        if (toolCalls && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
                ctx.log(`${getToolLabel(toolCall.toolName)}...`);
            }
            
            messages.push({
                role: "assistant",
                content: toolCalls,
            });

            const toolResultContent = toolResults.map(tr => ({
                type: tr.type,
                toolCallId: tr.toolCallId,
                toolName: tr.toolName,
                output: tr.output as any,
            }));

            const toolResultMessage: ToolModelMessage = {
                role: "tool",
                content: toolResultContent
            };
            messages.push(toolResultMessage);

            continue;
        }

        const thoughtMs = Date.now() - startTime;
        thoughtTimeStr = thoughtMs < 1000 ? `${thoughtMs}ms` : `${(thoughtMs / 1000).toFixed(1)}s`;

        let response = "";
        const stream = appContext.services.llm.streamLlm(
            systemPrompt,
            [...messages, { role: "assistant", content: text }],
            appContext.selectedModel.modelId,
            async (result) => {
                savedAssistantMsg = await appContext.services.memoryService.saveTurnToMemory(
                    result,
                    "agent",
                    thoughtTimeStr
                );
            }
        );

        let firstChunk = true;
        for await (const chunk of stream) {
            response += chunk;
            if (firstChunk) {
                ctx.replaceLast(response);
                firstChunk = false;
            } else {
                ctx.replaceLast(response);
            }
        }

        if (savedAssistantMsg && ctx.replaceLastWithItem) {
            ctx.replaceLastWithItem({
                type: "assistant",
                content: {
                    ...savedAssistantMsg,
                    thought_time: thoughtTimeStr || savedAssistantMsg.thought_time,
                },
            });
        }

        return;
    }

    ctx.error("Agent reached maximum steps without completing. Try rephrasing your question.");
}

function getToolLabel(toolName: string): string {
    const labels: Record<string, string> = {
        dbOverviewTool: "Analyzing database",
        semanticSearchTool: "Searching schema knowledge",
        getAvailableDatabaseTool: "Checking connected databases",
        isStaleTool: "Checking index freshness",
        reIndexCompleteDatabase: "Re-indexing database",
    };
    return labels[toolName] ?? `Running ${toolName}`;
}

function buildSystemPromptWithContext(
    basePrompt: string,
    user: User | null,
    databases: string[]
): string {
    const userEmail = user?.email || "Not logged in";
    const userName = user?.email ? user.email.split("@")[0] : "Developer";
    const dbList = databases.length > 0 ? databases.join(", ") : "None connected";

    return `${basePrompt.trim()}

### Active Environment Context:
- Talking to User: ${userName} (${userEmail})
- Connected Databases (${databases.length}): ${dbList}`;
}

